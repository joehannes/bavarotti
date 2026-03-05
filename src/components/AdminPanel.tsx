import { useEffect, useMemo, useState, type ChangeEvent } from 'react';
import { updateJsonBin } from '../services/jsonBin';
import { deleteImageFromCloudinary, uploadImageToCloudinary } from '../services/cloudinary';
import type { Category, MenuItem, Translations } from '../services/types';

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

type EditableMenuItem = {
  id: string;
  categoryId: string;
  price: number;
  currency: string;
  available: boolean;
  imageUrl: string;
  imageAltEn: string;
  imageAltEs: string;
  nameEn: string;
  nameEs: string;
  descEn: string;
  descEs: string;
  nameKey: string;
  descriptionKey: string;
  altKey: string;
};


const normalizeTranslations = (value: Translations | { record?: Translations }): Translations => {
  if (value && typeof value === 'object' && 'record' in value) {
    const record = value.record;
    if (record && typeof record === 'object' && !Array.isArray(record)) {
      return record;
    }
  }

  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Translations;
  }

  return {};
};

const normalizeEnvelope = <T,>(value: T | { record?: T }): T | null => {
  if (value && typeof value === 'object' && 'record' in (value as object)) {
    return ((value as { record?: T }).record ?? null) as T | null;
  }

  return (value as T) ?? null;
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || `item-${Date.now()}`;

const readableLabel = (item: EditableMenuItem) => {
  const label = item.nameEn || item.nameEs;
  return label ? `${label} (${item.id})` : item.id;
};

const AdminPanel = ({ translations, otp, apiKey, cloudinary, resourceUrls, onClose }: AdminPanelProps) => {
  const [inputOtp, setInputOtp] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [status, setStatus] = useState<UpdateState>('idle');
  const [error, setError] = useState('');
  const [menuDraft, setMenuDraft] = useState<EditableMenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const categoriesOptions = useMemo(() => categories.map((category) => category.id), [categories]);
  const { menu: menuUrl, translationsEn: translationsEnUrl, translationsEs: translationsEsUrl, categories: categoriesUrl } = resourceUrls;


  useEffect(() => {
    if (!isUnlocked) {
      setStatus('idle');
      return;
    }

    const loadAdminData = async () => {
      if (!menuUrl || !translationsEnUrl || !translationsEsUrl || !categoriesUrl) {
        setError(translations['admin.missingUrl'] ?? 'Resource URL missing.');
        return;
      }

      try {
        setStatus('saving');
        const [menuResponse, enResponse, esResponse, categoriesResponse] = await Promise.all([
          fetch(menuUrl, { cache: 'no-store' }),
          fetch(translationsEnUrl, { cache: 'no-store' }),
          fetch(translationsEsUrl, { cache: 'no-store' }),
          fetch(categoriesUrl, { cache: 'no-store' }),
        ]);

        if (!menuResponse.ok || !enResponse.ok || !esResponse.ok || !categoriesResponse.ok) {
          throw new Error('Failed to fetch admin resources');
        }

        const menuJson = (await menuResponse.json()) as MenuItem[] | { record?: MenuItem[] };
        const enJson = (await enResponse.json()) as Translations | { record?: Translations };
        const esJson = (await esResponse.json()) as Translations | { record?: Translations };
        const categoriesJson = (await categoriesResponse.json()) as Category[] | { record?: Category[] };

        const menuEnvelope = normalizeEnvelope(menuJson);
        const menu = Array.isArray(menuEnvelope) ? menuEnvelope : [];

        const translationsEn = normalizeTranslations(enJson);
        const translationsEs = normalizeTranslations(esJson);

        const categoriesEnvelope = normalizeEnvelope(categoriesJson);
        const normalizedCategories = Array.isArray(categoriesEnvelope) ? categoriesEnvelope : [];

        const editable = menu.map<EditableMenuItem>((item) => {
          const nameKey = item.nameKey || `menu.${item.id}.name`;
          const descriptionKey = item.descriptionKey || `menu.${item.id}.desc`;
          const altKey = item.image?.altKey || `menu.${item.id}.alt`;

          return {
            id: item.id,
            categoryId: item.categoryId,
            price: item.price,
            currency: item.currency,
            available: item.available,
            imageUrl: item.image?.url ?? '',
            imageAltEn: translationsEn[altKey] ?? '',
            imageAltEs: translationsEs[altKey] ?? '',
            nameEn: translationsEn[nameKey] ?? '',
            nameEs: translationsEs[nameKey] ?? '',
            descEn: translationsEn[descriptionKey] ?? '',
            descEs: translationsEs[descriptionKey] ?? '',
            nameKey,
            descriptionKey,
            altKey,
          };
        });

        setMenuDraft(editable);
        setCategories(normalizedCategories);
        setStatus('idle');
        setError('');
      } catch {
        setStatus('error');
        setError(translations['admin.unknownError'] ?? 'Failed loading admin data.');
      }
    };

    void loadAdminData();
  }, [isUnlocked, menuUrl, translationsEnUrl, translationsEsUrl, categoriesUrl, translations]);

  const handleUnlock = () => {
    if (!otp) {
      setError('Admin OTP is missing in environment variables.');
      return;
    }

    if (inputOtp.trim() === otp.trim()) {
      setIsUnlocked(true);
      setError('');
      return;
    }

    setError(translations['admin.otpError'] ?? 'Invalid OTP');
  };

  const updateItem = (itemId: string, changes: Partial<EditableMenuItem>) => {
    setMenuDraft((prev) => prev.map((item) => (item.id === itemId ? { ...item, ...changes } : item)));
  };

  const handleAddItem = () => {
    const baseId = `nuevo-${menuDraft.length + 1}`;
    const id = menuDraft.some((item) => item.id === baseId) ? `${baseId}-${Date.now()}` : baseId;

    setMenuDraft((prev) => [
      {
        id,
        categoryId: categoriesOptions[0] ?? 'pasta',
        price: 0,
        currency: 'USD',
        available: true,
        imageUrl: '',
        imageAltEn: '',
        imageAltEs: '',
        nameEn: '',
        nameEs: '',
        descEn: '',
        descEs: '',
        nameKey: `menu.${id}.name`,
        descriptionKey: `menu.${id}.desc`,
        altKey: `menu.${id}.alt`,
      },
      ...prev,
    ]);
  };

  const handleDeleteItem = async (itemId: string) => {
    const item = menuDraft.find((entry) => entry.id === itemId);
    if (item?.imageUrl) {
      try {
        await deleteImageFromCloudinary(item.imageUrl, cloudinary);
      } catch {
        // best effort
      }
    }
    setMenuDraft((prev) => prev.filter((entry) => entry.id !== itemId));
  };

  const handleUploadImage =
    (itemId: string) =>
    async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) {
        return;
      }

      if (!cloudinary.cloudName || !cloudinary.apiKey || !cloudinary.apiSecret) {
        setError('Cloudinary configuration is missing.');
        return;
      }

      try {
        setStatus('saving');
        const uploaded = await uploadImageToCloudinary(file, cloudinary);
        updateItem(itemId, { imageUrl: uploaded.secure_url });
        setStatus('saved');
      } catch (uploadError) {
        setStatus('error');
        setError(uploadError instanceof Error ? uploadError.message : 'Image upload failed.');
      }
    };

  const handleDeleteImage = async (itemId: string) => {
    const item = menuDraft.find((entry) => entry.id === itemId);
    if (!item?.imageUrl) {
      return;
    }

    try {
      setStatus('saving');
      await deleteImageFromCloudinary(item.imageUrl, cloudinary);
      updateItem(itemId, { imageUrl: '' });
      setStatus('saved');
    } catch (deleteError) {
      setStatus('error');
      setError(deleteError instanceof Error ? deleteError.message : 'Image delete failed.');
    }
  };

  const handleSaveAll = async () => {
    if (!apiKey) {
      setError(translations['admin.missingKey'] ?? 'API key missing.');
      return;
    }

    if (!menuUrl || !translationsEnUrl || !translationsEsUrl) {
      setError(translations['admin.missingUrl'] ?? 'Resource URL missing.');
      return;
    }

    try {
      setStatus('saving');

      const cleaned = menuDraft.map((item) => {
        const generatedId = item.id || slugify(item.nameEn || item.nameEs);
        const keyBase = `menu.${generatedId}`;
        return {
          ...item,
          id: generatedId,
          nameKey: item.nameKey || `${keyBase}.name`,
          descriptionKey: item.descriptionKey || `${keyBase}.desc`,
          altKey: item.altKey || `${keyBase}.alt`,
        };
      });

      const menuPayload: MenuItem[] = cleaned.map((item) => ({
        id: item.id,
        categoryId: item.categoryId,
        nameKey: item.nameKey,
        descriptionKey: item.descriptionKey,
        price: Number(item.price) || 0,
        currency: item.currency || 'USD',
        available: item.available,
        image: item.imageUrl
          ? {
              url: item.imageUrl,
              altKey: item.altKey,
            }
          : undefined,
      }));

      const [translationsEnResponse, translationsEsResponse] = await Promise.all([
        fetch(translationsEnUrl, { cache: 'no-store' }),
        fetch(translationsEsUrl, { cache: 'no-store' }),
      ]);

      const enJson = (await translationsEnResponse.json()) as Translations | { record?: Translations };
      const esJson = (await translationsEsResponse.json()) as Translations | { record?: Translations };

      const translationsEn = { ...normalizeTranslations(enJson) };
      const translationsEs = { ...normalizeTranslations(esJson) };

      cleaned.forEach((item) => {
        translationsEn[item.nameKey] = item.nameEn || item.id;
        translationsEs[item.nameKey] = item.nameEs || item.nameEn || item.id;
        translationsEn[item.descriptionKey] = item.descEn || '';
        translationsEs[item.descriptionKey] = item.descEs || '';

        if (item.imageUrl) {
          translationsEn[item.altKey] = item.imageAltEn || item.nameEn || item.id;
          translationsEs[item.altKey] = item.imageAltEs || item.nameEs || item.nameEn || item.id;
        }
      });

      await Promise.all([
        updateJsonBin(menuUrl, apiKey, menuPayload),
        updateJsonBin(translationsEnUrl, apiKey, translationsEn),
        updateJsonBin(translationsEsUrl, apiKey, translationsEs),
      ]);

      setMenuDraft(cleaned);
      setStatus('saved');
      setError('');
    } catch (saveError) {
      setStatus('error');
      setError(saveError instanceof Error ? saveError.message : 'Failed saving menu/translations.');
    }
  };

  return (
    <div className="admin-panel" role="dialog" aria-modal="true">
      <div className="admin-panel__card">
        <div className="admin-panel__header">
          <h3>{translations['admin.title'] ?? 'Admin panel'}</h3>
          <button className="link-button" type="button" onClick={onClose}>
            {translations['admin.close'] ?? 'Close'}
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
              <button className="btn btn--wa" type="button" onClick={handleUnlock}>
                {translations['admin.unlock']}
              </button>
            </div>
          </div>
        ) : (
          <section className="admin-editor">
            <div className="admin-editor__header">
              <h4>Food Manager (ES/EN)</h4>
              <div className="admin-editor__actions">
                <button type="button" className="btn btn--ghost" onClick={handleAddItem}>
                  Add food item
                </button>
                <button type="button" className="btn btn--wa" onClick={handleSaveAll}>
                  {status === 'saving' ? (translations['admin.saving'] ?? 'Saving...') : 'Save all changes'}
                </button>
              </div>
            </div>

            <div className="admin-editor__list">
              {menuDraft.map((item) => (
                <article className="admin-item" key={item.id}>
                  <div className="admin-item__top">
                    <strong>{readableLabel(item)}</strong>
                    <button
                      type="button"
                      className="btn btn--danger"
                      onClick={() => void handleDeleteItem(item.id)}
                    >
                      Delete
                    </button>
                  </div>

                  <div className="admin-editor__grid">
                    <input
                      value={item.nameEs}
                      onChange={(event) => updateItem(item.id, { nameEs: event.target.value })}
                      placeholder="Título (Español)"
                    />
                    <input
                      value={item.nameEn}
                      onChange={(event) => updateItem(item.id, { nameEn: event.target.value })}
                      placeholder="Title (English)"
                    />
                    <input
                      value={item.descEs}
                      onChange={(event) => updateItem(item.id, { descEs: event.target.value })}
                      placeholder="Descripción (Español)"
                    />
                    <input
                      value={item.descEn}
                      onChange={(event) => updateItem(item.id, { descEn: event.target.value })}
                      placeholder="Description (English)"
                    />
                    <input
                      type="number"
                      value={item.price}
                      onChange={(event) => updateItem(item.id, { price: Number(event.target.value) })}
                      placeholder="Price"
                    />
                    <input
                      value={item.currency}
                      onChange={(event) => updateItem(item.id, { currency: event.target.value })}
                      placeholder="Currency"
                    />
                    <select
                      value={item.categoryId}
                      onChange={(event) => updateItem(item.id, { categoryId: event.target.value })}
                    >
                      {categoriesOptions.map((categoryId) => (
                        <option key={categoryId} value={categoryId}>
                          {categoryId}
                        </option>
                      ))}
                    </select>
                    <input
                      value={item.imageUrl}
                      onChange={(event) => updateItem(item.id, { imageUrl: event.target.value })}
                      placeholder="Image URL"
                    />
                    <input
                      value={item.imageAltEs}
                      onChange={(event) => updateItem(item.id, { imageAltEs: event.target.value })}
                      placeholder="Imagen ALT (Español)"
                    />
                    <input
                      value={item.imageAltEn}
                      onChange={(event) => updateItem(item.id, { imageAltEn: event.target.value })}
                      placeholder="Image ALT (English)"
                    />
                    <label className="admin-editor__checkbox">
                      <input
                        type="checkbox"
                        checked={item.available}
                        onChange={(event) => updateItem(item.id, { available: event.target.checked })}
                      />
                      available
                    </label>
                    <input type="file" accept="image/*" onChange={handleUploadImage(item.id)} />
                    <button
                      type="button"
                      className="btn btn--ghost"
                      onClick={() => void handleDeleteImage(item.id)}
                    >
                      Delete image
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {error ? <p className="admin-panel__error">{error}</p> : null}
      </div>
    </div>
  );
};

export default AdminPanel;
