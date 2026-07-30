import { useEffect, useState } from 'react';
import { getPhotoUrl } from '../lib/debts';

export function DebtPhoto({ path, name }: { path: string | null; name: string }) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!path) return;
    void getPhotoUrl(path).then(setUrl);
  }, [path]);

  if (!url) return <div className="detail-avatar">{name.charAt(0).toUpperCase()}</div>;
  return <img className="detail-photo" src={url} alt={`Фото: ${name}`} />;
}
