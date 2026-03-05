import { useEffect, useMemo, useState, type ChangeEvent } from 'react';
import { updateJsonBin } from '../services/jsonBin';
import { deleteImageFromCloudinary, uploadImageToCloudinary } from '../services/cloudinary';
import type { MenuItem, Translations } from '../services/types';

type AdminPanelProps = {
  translations: Translations;
  otp: string;
  apiKey: string;
  cloudinary: {
    cloudName: string;
    apiKey: string;
    apiSecret: string;
    folder?: string;
  };
  resourceUrls: Record<string, string | undefined>;
  onClose: () => void;
};

type UpdateState = 'idle' | 'saving' | 'saved' | 'error';

const createEmptyItem = (): MenuItem => ({
  id: `item-${Date.now()}`,
  categoryId: '',
  nameKey: '',
  descriptionKey: '',
  price: 0,
  currency: 'USD',
  image: { url: '', altKey: '' },
  available: true,
});

const AdminPanel = ({ translations, otp, apiKey, cloudinary, resourceUrls, onClose }: AdminPanelProps) => {
  const [inputOtp, setInputOtp] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [selectedResource, setSelectedResource] = useState('menu');
  const [payload, setPayload] = useState('');
  const [status, setStatus] = useState<UpdateState>('idle');
  const [error, setError] = useState('');
  const [menuDraft, setMenuDraft] = useState<MenuItem[]>([]);

  const resources = useMemo(
    () =>
      Object.entries(resourceUrls)
        .filter(([, url]) => Boolean(url))
        .map(([key]) => key),
    [resourceUrls],
  );

  useEffect(() => {
    if (!isUnlocked) {
      return;
    }

    const url = resourceUrls.menu;
    if (!url) {
      return;
    }

    const loadMenu = async () => {
      try {
        const response = await fetch(url, { cache: 'no-store' });
        const json = (await response.json()) as MenuItem[] | { record?: MenuItem[] };
        const normalized = Array.isArray(json)
          ? json
          : Array.isArray(json.record)
            ? json.record
            : [];
        setMenuDraft(normalized);
      } catch {
        setError(translations['admin.unknownError'] ?? 'Failed loading admin data.');
      }
    };

    void loadMenu();
  }, [isUnlocked, resourceUrls.menu, translations]);

  const canSubmit = isUnlocked && payload.trim().length > 0 && status !== 'saving';

  const handleUnlock = () => {
    if (!otp) {
      setError('Admin OTP is missing in environment variables.');
      return;
    }

    if (inputOtp.trim() === otp) {
      setIsUnlocked(true);
      setError('');
      return;
    }

    setError(translations['admin.otpError'] ?? 'Invalid OTP');
  };

  const handleRawSubmit = async () => {
    const url = resourceUrls[selectedResource];
    if (!url) {
      setError(translations['admin.missingUrl'] ?? 'Resource URL missing.');
      return;
    }

    if (!apiKey) {
      setError(translations['admin.missingKey'] ?? 'API key missing.');
      return;
    }

    try {
      const parsed = JSON.parse(payload);
      setStatus('saving');
      await updateJsonBin(url, apiKey, parsed);
      setStatus('saved');
      setError('');
    } catch (submitError) {
      setStatus('error');
      setError(submitError instanceof Error ? submitError.message : translations['admin.unknownError']);
    }
  };

  const updateItemById = (itemId: string, changes: Partial<MenuItem>) => {
    setMenuDraft((prev) => prev.map((item) => (item.id === itemId ? { ...item, ...changes } : item)));
  };

  const handleCreateMenuItem = () => {
    setMenuDraft((prev) => [createEmptyItem(), ...prev]);
  };

  const handleDeleteMenuItem = (itemId: string) => {
    setMenuDraft((prev) => prev.filter((item) => item.id !== itemId));
  };

  const handleSaveMenu = async () => {
    const url = resourceUrls.menu;
    if (!url || !apiKey) {
      setError('Missing menu URL or API key.');
      return;
    }

    try {
      setStatus('saving');
      await updateJsonBin(url, apiKey, menuDraft);
      setStatus('saved');
      setError('');
    } catch (saveError) {
      setStatus('error');
      setError(saveError instanceof Error ? saveError.message : 'Failed saving menu.');
    }
  };

  const handleUploadImage =
    (itemId: string) =>
    async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      const targetItem = menuDraft.find((item) => item.id === itemId);
      if (!file || !targetItem) {
        return;
      }

      if (!cloudinary.cloudName || !cloudinary.apiKey || !cloudinary.apiSecret) {
        setError('Cloudinary configuration is missing.');
        return;
      }

      try {
        setStatus('saving');
        const uploaded = await uploadImageToCloudinary(file, cloudinary);
        updateItemById(itemId, {
          image: {
            url: uploaded.secure_url,
            altKey: targetItem.image?.altKey ?? `${targetItem.nameKey}.alt`,
          },
        });
        setStatus('saved');
        setError('');
      } catch (uploadError) {
        setStatus('error');
        setError(uploadError instanceof Error ? uploadError.message : 'Image upload failed.');
      }
    };

  const handleDeleteImage = async (itemId: string) => {
    const targetItem = menuDraft.find((item) => item.id === itemId);
    if (!targetItem?.image?.url) {
      return;
    }

    try {
      setStatus('saving');
      await deleteImageFromCloudinary(targetItem.image.url, cloudinary);
      updateItemById(itemId, { image: undefined });
      setStatus('saved');
      setError('');
    } catch (deleteError) {
      setStatus('error');
      setError(deleteError instanceof Error ? deleteError.message : 'Image delete failed.');
    }
  };

  return (
    <div className="admin-panel" role="dialog" aria-modal="true">
      <div className="admin-panel__card">
        <div className="admin-panel__header">
          <h3>{translations['admin.title']}</h3>
          <button className="link-button" type="button" onClick={onClose}>
            {translations['admin.close']}
          </button>
        </div>

        {!isUnlocked ? (
          <div className="admin-panel__lock">
            <p>{translations['admin.description']}</p>
            <div className="admin-panel__row">
              <input
                type="password"
                placeholder={translations['admin.otpPlaceholder']}
                value={inputOtp}
                onChange={(event) => setInputOtp(event.target.value)}
              />
              <button className="btn btn--primary" type="button" onClick={handleUnlock}>
                {translations['admin.unlock']}
              </button>
            </div>
          </div>
        ) : (
          <>
            <section className="admin-editor">
              <div className="admin-editor__header">
                <h4>Menu CRUD (mobile friendly)</h4>
                <div className="admin-editor__actions">
                  <button type="button" className="btn btn--ghost" onClick={handleCreateMenuItem}>
                    Add item
                  </button>
                  <button type="button" className="btn btn--primary" onClick={handleSaveMenu}>
                    Save all menu entries
                  </button>
                </div>
              </div>

              <div className="admin-editor__list">
                {menuDraft.map((item) => (
                  <article className="admin-item" key={item.id}>
                    <div className="admin-item__top">
                      <strong>{item.id || 'new-item'}</strong>
                      <button
                        type="button"
                        className="btn btn--danger"
                        onClick={() => handleDeleteMenuItem(item.id)}
                      >
                        Delete
                      </button>
                    </div>

                    <div className="admin-editor__grid">
                      <input
                        value={item.id}
                        onChange={(event) => updateItemById(item.id, { id: event.target.value })}
                        placeholder="id"
                      />
                      <input
                        value={item.categoryId}
                        onChange={(event) => updateItemById(item.id, { categoryId: event.target.value })}
                        placeholder="categoryId"
                      />
                      <input
                        value={item.nameKey}
                        onChange={(event) => updateItemById(item.id, { nameKey: event.target.value })}
                        placeholder="nameKey"
                      />
                      <input
                        value={item.descriptionKey ?? ''}
                        onChange={(event) => updateItemById(item.id, { descriptionKey: event.target.value })}
                        placeholder="descriptionKey"
                      />
                      <input
                        type="number"
                        value={item.price}
                        onChange={(event) => updateItemById(item.id, { price: Number(event.target.value) })}
                        placeholder="price"
                      />
                      <input
                        value={item.currency}
                        onChange={(event) => updateItemById(item.id, { currency: event.target.value })}
                        placeholder="currency"
                      />
                      <input
                        value={item.image?.url ?? ''}
                        onChange={(event) =>
                          updateItemById(item.id, {
                            image: {
                              url: event.target.value,
                              altKey: item.image?.altKey ?? '',
                            },
                          })
                        }
                        placeholder="image url"
                      />
                      <input
                        value={item.image?.altKey ?? ''}
                        onChange={(event) =>
                          updateItemById(item.id, {
                            image: {
                              url: item.image?.url ?? '',
                              altKey: event.target.value,
                            },
                          })
                        }
                        placeholder="image alt key"
                      />

                      <label className="admin-editor__checkbox">
                        <input
                          type="checkbox"
                          checked={item.available}
                          onChange={(event) => updateItemById(item.id, { available: event.target.checked })}
                        />
                        available
                      </label>
                      <input type="file" accept="image/*" onChange={handleUploadImage(item.id)} />
                      <button
                        type="button"
                        className="btn btn--ghost"
                        onClick={() => handleDeleteImage(item.id)}
                      >
                        Delete image
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="admin-editor">
              <h4>Raw JSON editor</h4>
              <div className="admin-panel__row">
                <label htmlFor="resource">{translations['admin.resourceLabel']}</label>
                <select
                  id="resource"
                  value={selectedResource}
                  onChange={(event) => setSelectedResource(event.target.value)}
                >
                  {resources.map((resource) => (
                    <option key={resource} value={resource}>
                      {translations[`admin.resource.${resource}`] ?? resource}
                    </option>
                  ))}
                </select>
              </div>
              <textarea
                rows={8}
                value={payload}
                onChange={(event) => setPayload(event.target.value)}
                placeholder={translations['admin.payloadPlaceholder']}
              />
              <button className="btn btn--primary" type="button" onClick={handleRawSubmit} disabled={!canSubmit}>
                {status === 'saving' ? translations['admin.saving'] : translations['admin.save']}
              </button>
            </section>
          </>
        )}

        {error ? <p className="admin-panel__error">{error}</p> : null}
      </div>
    </div>
  );
};

export default AdminPanel;
