import { useId } from 'react';
import { Corota } from './landscape/Corota';
import { Mountains } from './landscape/Mountains';
import { StoryShore } from './landscape/StoryShore';
import { WaterMarks } from './landscape/WaterMarks';
import { StoryRiver } from './StoryRiver';
import { StorySurface } from './StorySurface';

/** Native vector scenery is present on the first paint, even offline or without WebGL. */
export function StoryLandscape({ foreground = false }: { foreground?: boolean }) {
  const id = useId();
  if (foreground) return <svg className="lg-landscape lg-landscape-front" viewBox="0 0 1000 1890" preserveAspectRatio="none" aria-hidden="true"><StorySurface /><StoryShore /><StoryRiver foreground /></svg>;
  return (
    <svg className="lg-landscape" viewBox="0 0 1000 1890" preserveAspectRatio="none" role="img" aria-labelledby={`${id}-title ${id}-description`}>
      <title id={`${id}-title`}>La laguna de La Cocha y la isla de La Corota</title>
      <desc id={`${id}-description`}>Una isla baja cubierta de bosque, entre montañas y agua azul grisácea. Un canal entra entre la totora y las casas del embarcadero.</desc>
      <rect width="1000" height="860" fill="var(--sc-sky)" />
      <g fill="var(--sc-cloud)">
        <path d="M0 91q41-20 82-8 25-26 60-10 39-15 68 13 59-9 97 16H0Z" />
        <path d="M455 106q32-26 69-14 10-23 43-16 27-23 60-4 37-10 57 19 58-2 89 24H444Z" />
        <path d="M826 41q32-17 60-3 26-23 62-3 37-3 52 13v14H822Z" />
      </g>
      <Mountains />
      <path d="M0 306H1000V860H0Z" fill="var(--sc-water-far)" />
      <path d="M0 482q240-8 490 2t510-3V860H0Z" fill="var(--sc-water)" />
      <path d="M0 674q275-12 510 0t490-7V860H0Z" fill="var(--sc-water)" />
      <WaterMarks />
      <Corota crownId={`${id}-crown`} />
      <StoryShore />
      <StoryRiver />
    </svg>
  );
}
