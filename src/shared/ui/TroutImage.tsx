interface TroutImageProps {
  /** Width in CSS pixels; the height follows the picture */
  width: number;
  className?: string;
}

/**
 * The project's trout as a still picture (public/objects/trucha.png, rendered from the 3D model's
 * reference). It is the only glossy thing in the app and purely decorative, so screen
 * readers skip it. Where the trout swims, the 3D school takes its place (src/shared/three/fish).
 */
export function TroutImage({ width, className = '' }: TroutImageProps) {
  return (
    <img
      className={`trout-image ${className}`}
      src="/objects/trucha.png"
      width={width}
      height={Math.round((width * 253) / 560)}
      alt=""
      decoding="async"
      draggable={false}
    />
  );
}
