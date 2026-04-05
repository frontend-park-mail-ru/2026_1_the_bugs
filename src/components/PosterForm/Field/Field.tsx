import styles from '../PosterForm.module.css';
import type { CreatePosterField } from '../validation';

interface InputProps {
  field: Exclude<CreatePosterField, 'features' | 'images'>;
  label: string;
  value: string;
  errors: Partial<Record<CreatePosterField, string>>;
  onChange: (field: Exclude<CreatePosterField, 'features' | 'images'>, value: string) => void;
  showErrorText?: boolean;
  placeholder?: string;
  type?: 'text' | 'email';
}

export function Field({ field, label, value, errors, onChange, showErrorText = false, placeholder, type = 'text' }: InputProps) {
  const error = errors[field];
  const isAddressField = field === 'address';
  const className = [
    styles.input,
    isAddressField ? styles.addressInput : '',
    error ? styles.inputError : ''
  ].filter(Boolean).join(' ');

  return (
    <div className={styles.group}>
      <label className={styles.label} htmlFor={field}>{label}</label>
      <input
        id={field}
        className={className}
        type={type}
        value={value}
        placeholder={placeholder ?? ''}
        onInput={(e: any) => onChange(field, e.target.value)}
      />
      {showErrorText && error && <span className={styles.error}>{error}</span>}
    </div>
  );
}