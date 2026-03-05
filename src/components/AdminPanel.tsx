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

const emptyItem = (): MenuItem => ({
  id: '',
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
  const [selectedMenuId, setSelectedMenuId] = useState('');

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
        setSelectedMenuId(normalized[0]?.id ?? '');
      } catch {
        setError(translations['admin.unknownError'] ?? 'Failed loading admin data.');
      }
    };

    void loadMenu();
  }, [isUnlocked, resourceUrls.menu, translations]);

  const canSubmit = isUnlocked && payload.trim().length > 0 && status !== 'saving';
  const selectedMenuItem = menuDraft.find((item) => item.id === selectedMenuId);

  const handleUnlock = () => {
    if (!otp) {
      setError('Admin OTP is missing in environment variables.');
      return;
    }

    if (inputOtp.trim() === otp) {
      setIsUnlocked(true);
      setError('');
    } else {
      setError(translations['admin.otpError'] ?? 'Invalid OTP');
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

  const updateSelectedItem = (changes: Partial<MenuItem>) => {
    setMenuDraft((prev) => prev.map((item) => (item.id === selectedMenuId ? { ...item, ...changes } : item)));
  };

  const handleCreateMenuItem = () => {
    const next = emptyItem();
    next.id = `item-${Date.now()}`;
    setMenuDraft((prev) => [...prev, next]);
    setSelectedMenuId(next.id);
  };

  const handleDeleteMenuItem = () => {
    if (!selectedMenuItem) {
      return;
    }

    setMenuDraft((prev) => prev.filter((item) => item.id !== selectedMenuItem.id));
    setSelectedMenuId('');
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

  const handleUploadImage = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedMenuItem) {
      return;
    }

    if (!cloudinary.cloudName || !cloudinary.apiKey || !cloudinary.apiSecret) {
      setError('Cloudinary configuration is missing.');
      return;
    }

    try {
      setStatus('saving');
      const uploaded = await uploadImageToCloudinary(file, cloudinary);
      updateSelectedItem({
        image: {
          url: uploaded.secure_url,
          altKey: selectedMenuItem.image?.altKey ?? `${selectedMenuItem.nameKey}.alt`,
        },
      });
      setStatus('saved');
      setError('');
    } catch (uploadError) {
      setStatus('error');
      setError(uploadError instanceof Error ? uploadError.message : 'Image upload failed.');
    }
  };

  const handleDeleteImage = async () => {
    if (!selectedMenuItem?.image?.url) {
      return;
    }

    try {
      setStatus('saving');
      await deleteImageFromCloudinary(selectedMenuItem.image.url, cloudinary);
      updateSelectedItem({ image: undefined });
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
                <h4>Menu CRUD</h4>
                <div className="admin-editor__actions">
                  <button type="button" className="btn btn--ghost" onClick={handleCreateMenuItem}>Add item</button>
                  <button type="button" className="btn btn--ghost" onClick={handleDeleteMenuItem}>Delete item</button>
                  <button type="button" className="btn btn--primary" onClick={handleSaveMenu}>Save menu</button>
                </div>
              </div>

              <div className="admin-panel__row">
                <label htmlFor="menu-item">Item</label>
                <select id="menu-item" value={selectedMenuId} onChange={(event) => setSelectedMenuId(event.target.value)}>
                  {menuDraft.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.id}
                    </option>
                  ))}
                </select>
              </div>

              {selectedMenuItem ? (
                <div className="admin-editor__grid">
                  <input value={selectedMenuItem.id} onChange={(event) => updateSelectedItem({ id: event.target.value })} placeholder="id" />
                  <input value={selectedMenuItem.categoryId} onChange={(event) => updateSelectedItem({ categoryId: event.target.value })} placeholder="categoryId" />
                  <input value={selectedMenuItem.nameKey} onChange={(event) => updateSelectedItem({ nameKey: event.target.value })} placeholder="nameKey" />
                  <input value={selectedMenuItem.descriptionKey ?? ''} onChange={(event) => updateSelectedItem({ descriptionKey: event.target.value })} placeholder="descriptionKey" />
                  <input type="number" value={selectedMenuItem.price} onChange={(event) => updateSelectedItem({ price: Number(event.target.value) })} placeholder="price" />
                  <input value={selectedMenuItem.currency} onChange={(event) => updateSelectedItem({ currency: event.target.value })} placeholder="currency" />
                  <input value={selectedMenuItem.image?.url ?? ''} onChange={(event) => updateSelectedItem({ image: { url: event.target.value, altKey: selectedMenuItem.image?.altKey ?? '' } })} placeholder="image url" />
                  <input value={selectedMenuItem.image?.altKey ?? ''} onChange={(event) => updateSelectedItem({ image: { url: selectedMenuItem.image?.url ?? '', altKey: event.target.value } })} placeholder="image alt key" />
                  <label className="admin-editor__checkbox">
                    <input type="checkbox" checked={selectedMenuItem.available} onChange={(event) => updateSelectedItem({ available: event.target.checked })} />
                    available
                  </label>
                  <input type="file" accept="image/*" onChange={handleUploadImage} />
                  <button type="button" className="btn btn--ghost" onClick={handleDeleteImage}>Delete image from Cloudinary</button>
                </div>
              ) : null}
            </section>

            <section className="admin-editor">
              <h4>Raw JSON editor</h4>
              <div className="admin-panel__row">
                <label htmlFor="resource">{translations['admin.resourceLabel']}</label>
                <select id="resource" value={selectedResource} onChange={(event) => setSelectedResource(event.target.value)}>
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
