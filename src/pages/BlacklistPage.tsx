import { useEffect, useState } from 'react';
import { AppHeader } from '../components/AppHeader';
import { addToBlacklist, loadBlacklist, removeFromBlacklist } from '../lib/blacklist';
import type { BlacklistEntry } from '../types/blacklist';
import { useI18n } from '../context/I18nContext';

export function BlacklistPage() {
  const [entries, setEntries] = useState<BlacklistEntry[]>([]);
  const [name, setName] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const t = useI18n();

  async function refresh() {
    try {
      setEntries(await loadBlacklist());
    } catch {
      setError(t('blacklistLoadError'));
    }
  }

  useEffect(() => { void refresh(); }, []);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    try {
      await addToBlacklist(name, reason);
      setName('');
      setReason('');
      await refresh();
    } catch {
      setError(t('blacklistAddError'));
    }
  }

  async function remove(id: string) {
    await removeFromBlacklist(id);
    await refresh();
  }

  return (
    <main className="app-shell app-shell--detail">
      <AppHeader title={t('blacklist')} subtitle={t('personName').toUpperCase()} backHref="/" />
      <section className="blacklist-intro"><span>⛔</span><div><strong>{t('personalNote')}</strong><p>{t('blacklistHint')}</p></div></section>
      <form className="blacklist-form" onSubmit={submit}>
        <input value={name} onChange={(event) => setName(event.target.value)} placeholder={t('personName')} required />
        <input value={reason} onChange={(event) => setReason(event.target.value)} placeholder={t('reasonOptional')} />
        <button>{t('addToList')}</button>
      </form>
      {error && <p className="form-error">{error}</p>}
      <section className="blacklist-list">
        {entries.map((entry) => (
          <article key={entry.id}>
            <span>{entry.person_name.charAt(0).toUpperCase()}</span>
            <div><strong>{entry.person_name}</strong><small>{entry.reason || t('noReason')}</small></div>
            <button onClick={() => void remove(entry.id)} aria-label={`Убрать ${entry.person_name} из списка`}>×</button>
          </article>
        ))}
        {entries.length === 0 && <p>{t('emptyBlacklist')}</p>}
      </section>
    </main>
  );
}
