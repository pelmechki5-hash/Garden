import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { readableDebtError, saveDebt, uploadDebtPhoto, validateDebtPhoto } from '../lib/debts';
import type { Debt, DebtInput } from '../types/debt';
import { DateField } from './DateField';
import { useSettings } from '../context/SettingsContext';
import { currencies } from '../lib/currencies';
import { useI18n } from '../context/I18nContext';
import { loadBlacklist } from '../lib/blacklist';
import type { BlacklistEntry } from '../types/blacklist';

const today = new Date().toISOString().slice(0, 10);

export function DebtForm({ debt, onSaved }: { debt?: Debt; onSaved: () => Promise<void> }) {
  const [, navigate] = useLocation();
  const { settings, updateSettings } = useSettings();
  const t = useI18n();
  const defaultDueDate = new Date(Date.now() + settings.default_due_days * 86_400_000).toISOString().slice(0, 10);
  const [loanType, setLoanType] = useState<'money' | 'item'>(debt?.amount === null ? 'item' : 'money');
  const [form, setForm] = useState<DebtInput>({
    person_name: debt?.person_name ?? '',
    item_name: debt?.item_name ?? t('money'),
    amount: debt?.amount ?? null,
    currency: debt?.currency ?? settings.default_currency,
    description: debt?.description ?? '',
    lent_at: debt?.lent_at ?? today,
    due_at: debt?.due_at ?? (settings.default_due_days > 0 ? defaultDueDate : null),
    status: debt?.status ?? 'active',
  });
  const [photo, setPhoto] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [blacklist, setBlacklist] = useState<BlacklistEntry[]>([]);
  const normalizedName = form.person_name.trim().toLocaleLowerCase();
  const blacklistedPerson = blacklist.find(
    (entry) => entry.person_name.trim().toLocaleLowerCase() === normalizedName,
  );

  useEffect(() => {
    void loadBlacklist().then(setBlacklist).catch(() => undefined);
  }, []);

  function update<K extends keyof DebtInput>(key: K, value: DebtInput[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function choosePhoto(file: File | null) {
    if (!file) {
      setPhoto(null);
      return;
    }
    const validationError = validateDebtPhoto(file);
    if (validationError) {
      setPhoto(null);
      setError(validationError);
      return;
    }
    setError('');
    setPhoto(file);
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError('');
    let saved: Debt;
    try {
      saved = await saveDebt({ ...form, amount: loanType === 'item' ? null : form.amount }, debt?.id);
    } catch (saveError) {
      setError(`${t('saveDebtError')}: ${readableDebtError(saveError)}`);
      setSaving(false);
      return;
    }

    if (photo) {
      try {
        await uploadDebtPhoto(saved.id, photo, debt?.photo_path);
      } catch (photoError) {
        await onSaved();
        setError(`${t('photoSaveError')}: ${readableDebtError(photoError)}`);
        setSaving(false);
        return;
      }
    }

    try {
      await onSaved();
      if (!settings.onboarding_completed) await updateSettings({ onboarding_completed: true }).catch(() => undefined);
      navigate(`/debt/${saved.id}`);
    } catch (refreshError) {
      setError(`${t('refreshError')}: ${readableDebtError(refreshError)}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="debt-form" onSubmit={submit}>
      <label>{t('personName')}<input value={form.person_name} onChange={(e) => update('person_name', e.target.value)} required /></label>
      {blacklistedPerson && (
        <aside className="blacklist-warning" role="alert">
          <span>⚠</span>
          <div>
            <strong>{t('blacklistWarning', { name: blacklistedPerson.person_name })}</strong>
            <p>{blacklistedPerson.reason || t('noReason')}</p>
          </div>
        </aside>
      )}
      <fieldset className="loan-type">
        <legend>{t('whatLent')}</legend>
        <button type="button" className={loanType === 'money' ? 'active' : ''} onClick={() => { setLoanType('money'); update('item_name', t('money')); }}>💸 {t('money')}</button>
        <button type="button" className={loanType === 'item' ? 'active' : ''} onClick={() => { setLoanType('item'); update('amount', null); update('item_name', ''); }}>📦 {t('itemOther')}</button>
      </fieldset>
      <label>{loanType === 'money' ? t('whatLent') : t('itemName')}<input value={form.item_name} onChange={(e) => update('item_name', e.target.value)} required /></label>
      {loanType === 'money' && (
        <div className="form-row">
          <label>{t('amount')}<input type="number" min="0" step="0.01" value={form.amount ?? ''} onChange={(e) => update('amount', e.target.value ? Number(e.target.value) : null)} required /></label>
          <label>
            {t('currency')}
            <select value={form.currency} onChange={(e) => update('currency', e.target.value)}>
              {currencies.map((currency) => <option key={currency.code} value={currency.code}>{currency.code}</option>)}
            </select>
          </label>
        </div>
      )}
      <label>{t('comment')}<textarea rows={3} value={form.description} onChange={(e) => update('description', e.target.value)} /></label>
      <div className="form-row">
        <DateField label={t('lentDate')} value={form.lent_at} onChange={(value) => update('lent_at', value)} required />
        <DateField label={t('dueDate')} value={form.due_at ?? ''} min={form.lent_at} onChange={(value) => update('due_at', value || null)} />
      </div>
      <label className="photo-input">
        {t('photo')}
        <input type="file" accept="image/jpeg,image/png,image/webp,image/heic" onChange={(e) => choosePhoto(e.target.files?.[0] ?? null)} />
        <span>{photo ? `✓ ${photo.name}` : t('choosePhoto')}</span>
      </label>
      {error && <p className="form-error">{error}</p>}
      <button className="primary-button" type="submit" disabled={saving}>{saving ? t('loading') : debt ? t('saveChanges') : t('addDebt')}</button>
    </form>
  );
}
