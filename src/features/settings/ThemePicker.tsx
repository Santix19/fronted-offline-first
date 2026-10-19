import { Choices } from '../../shared/ui/Choices';
import { setTheme, THEME_LABELS, useTheme, type Theme } from '../../shared/ui/theme';

/**
 * Lets the caretaker pick the palette. It is not decoration: a phone screen under the sun of the
 * lagoon reads better in light, and the same screen at night in the shed reads better in dark.
 */
export function ThemePicker() {
  const theme = useTheme();

  return (
    <section className="panel">
      <h2>Colores</h2>
      <Choices
        label="Cómo se ve la app"
        name="theme"
        value={theme}
        options={THEME_LABELS}
        onChange={(next: Theme) => void setTheme(next)}
      />
      <p className="muted">Con sol directo se lee mejor el claro; de noche cansa menos el oscuro.</p>
    </section>
  );
}
