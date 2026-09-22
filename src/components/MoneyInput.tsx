import { useEffect, useState, type CSSProperties } from 'react';

function sanitize(raw: string): string {
  return raw.replace(/[^0-9.,]/g, '');
}

function parse(raw: string): number {
  const n = parseFloat(raw.replace(',', '.'));
  return Number.isFinite(n) ? n : 0;
}

interface Props {
  value: number;
  onChange: (n: number) => void;
  placeholder?: string;
  style?: CSSProperties;
}

export default function MoneyInput({ value, onChange, placeholder, style }: Props) {
  const [text, setText] = useState(value ? String(value).replace('.', ',') : '');

  useEffect(() => {
    if (parse(text) !== value) {
      setText(value ? String(value).replace('.', ',') : '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const clean = sanitize(e.target.value);
    setText(clean);
    onChange(parse(clean));
  }

  return (
    <input
      type="text"
      inputMode="decimal"
      value={text}
      onChange={handleChange}
      placeholder={placeholder}
      style={style}
    />
  );
}
