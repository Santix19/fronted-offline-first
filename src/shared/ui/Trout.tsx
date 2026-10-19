import { useId, type CSSProperties } from 'react';
import { TroutFins, TroutPectoralFin } from './TroutFins';
import { TroutMarkings } from './TroutMarkings';

interface TroutProps {
  /** Ancho en píxeles; el alto sale solo de la proporción */
  width?: number;
  className?: string;
  /** Lo decorativo se esconde de los lectores de pantalla */
  title?: string;
  /** Para que el banco le dé a cada trucha su altura y su velocidad */
  style?: CSSProperties;
}

/**
 * La trucha arcoíris de la laguna, dibujada aquí mismo en vez de traída como imagen: así escala
 * sin pixelarse en cualquier pantalla, pesa unos pocos kilobytes y se dibuja con los colores del
 * tema, de modo que cambia sola entre el claro y el oscuro.
 *
 * El cuerpo va largo y afilado, que es lo que la distingue de un pez cualquiera.
 */
export function Trout({ width = 240, className, title, style }: TroutProps) {
  // El banco dibuja varias truchas a la vez y dos degradados no pueden compartir el mismo id
  const gradient = useId();

  return (
    <svg
      className={className}
      style={style}
      width={width}
      height={width * 0.4}
      viewBox="0 0 400 160"
      role={title ? 'img' : 'presentation'}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <defs>
        {/* El lomo es más oscuro que el vientre, como se ve desde la orilla */}
        <linearGradient id={gradient} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--trout-back)" />
          <stop offset="46%" stopColor="var(--trout-mid)" />
          <stop offset="100%" stopColor="var(--trout-belly)" />
        </linearGradient>
      </defs>

      <TroutFins />
      <path
        d="M88 80
           C 130 40, 230 24, 310 44
           C 350 54, 378 66, 392 80
           C 378 94, 350 106, 310 116
           C 230 136, 130 120, 88 80 Z"
        fill={`url(#${gradient})`}
        stroke="var(--trout-edge)"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <TroutPectoralFin />
      <TroutMarkings />
    </svg>
  );
}
