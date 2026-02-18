import { useMemo, useState } from 'react';
import { updateJsonBin } from '../services/jsonBin';
import type { Translations } from '../services/types';

type AdminPanelProps = {
  translations: Translations;
  otp: string;
  apiKey: string;
  resourceUrls: Record<string, string | undefined>;
  onClose: () => void;
};

type UpdateState = 'idle' | 'saving' | 'saved' | 'error';

const AdminPanel = ({ translations, otp, apiKey, resourceUrls, onClose }: AdminPanelProps) => {
  const [inputOtp, setInputOtp] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [selectedResource, setSelectedResource] = useState('menu');
  const [payload, setPayload] = useState('');
  const [status, setStatus] = useState<UpdateState>('idle');
  const [error, setError] = useState('');

  const resources = useMemo(
    () =>
      Object.entries(resourceUrls)
        .filter(([, url]) => Boolean(url))
        .map(([key]) => key),
    [resourceUrls],
  );

  const canSubmit = isUnlocked && payload.trim().length > 0 && status !== 'saving';

  const handleUnlock = () => {
    if (inputOtp.trim() === otp) {
      setIsUnlocked(true);
      setError('');
    } else {
      setError(translations['admin.otpError']);
    }
  };

  const handleSubmit = async () => {
    const url = resourceUrls[selectedResource];
    if (!url) {
      setError(translations['admin.missingUrl']);
      return;
    }
    if (!apiKey) {
      setError(translations['admin.missingKey']);
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
      setError(
        submitError instanceof Error ? submitError.message : translations['admin.unknownError'],
      );
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
            {error ? <p className="admin-panel__error">{error}</p> : null}
          </div>
        ) : (
          <div className="admin-panel__body">
            <p>{translations['admin.instructions']}</p>
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
              rows={10}
              value={payload}
              onChange={(event) => setPayload(event.target.value)}
              placeholder={translations['admin.payloadPlaceholder']}
            />
            {error ? <p className="admin-panel__error">{error}</p> : null}
            <button className="btn btn--primary" type="button" onClick={handleSubmit} disabled={!canSubmit}>
              {status === 'saving'
                ? translations['admin.saving']
                : status === 'saved'
                  ? translations['admin.saved']
                  : translations['admin.save']}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
