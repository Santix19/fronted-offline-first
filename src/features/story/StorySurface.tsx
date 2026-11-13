/** Water lies above the trout: a blue film and broken reflections, without cast shadows. */
export function StorySurface() {
  return <g className="lg-water-surface" aria-hidden="true">
    <path d="M0 446H1000V3160H0Z" fill="var(--sc-water)" opacity=".22" />
    <g fill="none" stroke="var(--sc-water-line)" strokeWidth="3" opacity=".46" strokeLinecap="round">
      <path d="M260 490h76m112 21h90m168-16h62M297 589h114m80 18h81m104-29h60M239 728q94-12 175-2m138 16q82-12 167-1M243 921q106-17 183-3m100 23q98-13 209-1M198 1095q123-14 203 1m130 24q103-17 248-2M247 1280q95-16 185-2m141 21q107-16 192-4M210 1501q116-11 229 5m123 19q109-15 202-4M241 1711q102-17 180-1m114 22q111-16 242 0M214 1915q124-16 226-2m116 32q97-19 185-3M242 2129q91-14 167-1m134 14q91-14 202-3M230 2371q121-17 216 1m109 22q104-19 220-3M207 2594q110-18 223-1m123 22q101-19 206-4M235 2841q112-18 215-1m109 24q107-18 193-3" />
    </g>
  </g>;
}
