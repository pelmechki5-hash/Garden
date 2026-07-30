import { useRef, useState } from 'react';
import { useLocation } from 'wouter';
import { dueLabel, dueTone, lateFee } from '../lib/date';
import type { Debt } from '../types/debt';
import type { UserSettings } from '../types/settings';
import { useI18n } from '../context/I18nContext';

interface DebtCardProps {
  debt: Debt;
  burning?: boolean;
  onTrash?: (debt: Debt) => void;
  onTrashHover?: (hovering: boolean) => void;
  onPin?: (debt: Debt) => void;
  feeSettings: UserSettings;
}

export function DebtCard({ debt, burning = false, onTrash, onTrashHover, onPin, feeSettings }: DebtCardProps) {
  const [, navigate] = useLocation();
  const t = useI18n();
  const cardRef = useRef<HTMLElement>(null);
  const start = useRef({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const initial = debt.person_name.trim().charAt(0).toUpperCase();
  const fee = debt.status === 'active'
    ? lateFee(debt.due_at, feeSettings.late_fee_enabled, feeSettings.late_fee_start, feeSettings.late_fee_daily)
    : 0;
  const tone = debt.status === 'active' ? dueTone(debt.due_at) : 'safe';

  function isOverTrash(x: number, y: number) {
    const trash = document.getElementById('trash-drop');
    if (!trash) return false;
    const area = trash.getBoundingClientRect();
    const reach = 82;
    return (
      x >= area.left - reach &&
      x <= area.right + reach &&
      y >= area.top - reach &&
      y <= area.bottom + reach
    );
  }

  function startDrag(event: React.PointerEvent<HTMLButtonElement>) {
    start.current = { x: event.clientX, y: event.clientY };
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragging(true);
  }

  function moveDrag(event: React.PointerEvent<HTMLButtonElement>) {
    if (!dragging || !cardRef.current) return;
    const x = event.clientX - start.current.x;
    const y = event.clientY - start.current.y;
    cardRef.current.style.transform = `translate(${x}px, ${y}px) rotate(${x * 0.02}deg)`;
    const overTrash = isOverTrash(event.clientX, event.clientY);
    onTrashHover?.(overTrash);
    cardRef.current.classList.toggle('debt-card--trash-ready', overTrash);
  }

  function finishDrag(event: React.PointerEvent<HTMLButtonElement>) {
    if (!dragging) return;
    const shouldDelete = isOverTrash(event.clientX, event.clientY);
    setDragging(false);
    onTrashHover?.(false);
    if (cardRef.current) {
      cardRef.current.style.transform = '';
      cardRef.current.classList.remove('debt-card--trash-ready');
    }
    if (shouldDelete) onTrash?.(debt);
  }

  return (
    <article ref={cardRef} className={`debt-card ${dragging ? 'debt-card--dragging' : ''} ${burning ? 'debt-card--burning' : ''}`}>
      <div className={`debt-card__indicator debt-card__indicator--${tone}`} />
      <button className="debt-card__open" onClick={() => navigate(`/debt/${debt.id}`)} aria-label={`Открыть долг: ${debt.person_name}`}>
        <div className="avatar">{initial}</div>
      </button>
      <button className="debt-card__content" onClick={() => navigate(`/debt/${debt.id}`)}>
        <strong>{debt.person_name}</strong>
        <span>{debt.item_name}</span>
        <small className={`due-label due-label--${tone}`}>
          {debt.status === 'active'
            ? dueLabel(debt.due_at, {
                noDue: t('noDue'),
                overdue: (days) => t('overdueDays', { days }),
                today: t('dueToday'),
                left: (days) => t('daysLeft', { days }),
              })
            : t('returnedLabel')}
        </small>
      </button>
      <div className="debt-card__amount">
        {debt.amount !== null && <strong>{debt.amount.toLocaleString('ru-RU')} {debt.currency}</strong>}
        {fee > 0 && <em>+{fee.toLocaleString(feeSettings.language)} € {t('feeWord')}</em>}
      </div>
      {onPin && (
        <button
          className={`pin-button ${debt.pinned ? 'pin-button--active' : ''}`}
          onClick={() => onPin(debt)}
          aria-label={debt.pinned ? 'Открепить долг' : 'Закрепить долг наверху'}
          title={debt.pinned ? 'Открепить' : 'Закрепить наверху'}
        >★</button>
      )}
      {onTrash && (
        <button
          className="drag-handle"
          onPointerDown={startDrag}
          onPointerMove={moveDrag}
          onPointerUp={finishDrag}
          onPointerCancel={finishDrag}
          aria-label="Перетащить долг в корзину"
        >⠿</button>
      )}
      <div className="burn-effect" aria-hidden="true"><span>🔥</span><span>🔥</span><span>🔥</span></div>
    </article>
  );
}
