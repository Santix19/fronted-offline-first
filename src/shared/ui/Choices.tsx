interface ChoicesProps<T extends string> {
  label: string;
  name: string;
  value: T;
  options: Record<T, string>;
  onChange: (value: T) => void;
}

/** Big one-tap buttons instead of a dropdown: easier outdoors and with gloves. */
export function Choices<T extends string>({ label, name, value, options, onChange }: ChoicesProps<T>) {
  return (
    <fieldset className="field" style={{ border: 0, padding: 0, margin: 0 }}>
      <legend style={{ fontWeight: 700, marginBottom: 4 }}>{label}</legend>
      <div className="choices">
        {(Object.keys(options) as T[]).map((option) => (
          <label key={option}>
            <input type="radio" name={name} checked={value === option} onChange={() => onChange(option)} />
            <span>{options[option]}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
