import { useRef } from 'react';

interface DateFieldProps {
  label: string;
  value: string;
  min?: string;
  required?: boolean;
  onChange: (value: string) => void;
}

export function DateField({ label, value, min, required, onChange }: DateFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function openCalendar() {
    const input = inputRef.current;
    if (!input) return;
    try {
      input.showPicker();
    } catch {
      input.focus();
      input.click();
    }
  }

  return (
    <label className="date-field">
      {label}
      <span>
        <input
          ref={inputRef}
          type="date"
          value={value}
          min={min}
          required={required}
          onChange={(event) => onChange(event.target.value)}
        />
        <button type="button" onClick={openCalendar} aria-label={`Открыть календарь: ${label}`}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <rect x="3" y="5" width="18" height="16" rx="3" />
            <path d="M8 3v4M16 3v4M3 10h18" />
          </svg>
        </button>
      </span>
    </label>
  );
}
