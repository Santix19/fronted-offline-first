/**
 * Lo que le da el nombre a la arcoíris: la banda iridiscente del costado, los lunares oscuros del
 * lomo y el ojo. Van encima del cuerpo, que es donde se ven.
 */
export function TroutMarkings() {
  return (
    <>
      <path
        d="M110 84 C 180 98, 260 96, 346 80"
        fill="none"
        stroke="var(--trout-stripe)"
        strokeWidth="9"
        strokeLinecap="round"
        opacity="0.5"
      />
      <g fill="var(--trout-spot)" opacity="0.7">
        <ellipse cx="160" cy="68" rx="6" ry="4" />
        <ellipse cx="196" cy="58" rx="5.5" ry="4" />
        <ellipse cx="232" cy="56" rx="5.5" ry="4" />
        <ellipse cx="268" cy="58" rx="5" ry="3.5" />
        <ellipse cx="140" cy="84" rx="5" ry="3.5" />
        <ellipse cx="178" cy="78" rx="4.5" ry="3.5" />
        <ellipse cx="216" cy="76" rx="4.5" ry="3.5" />
      </g>
      <circle cx="356" cy="72" r="11" fill="var(--trout-belly)" stroke="var(--trout-edge)" strokeWidth="3.5" />
      <circle cx="358" cy="72" r="5" fill="var(--trout-eye)" />
    </>
  );
}
