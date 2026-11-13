const MARKS = Array.from({ length: 64 }, (_, i) => {
  const row = Math.floor(i / 8), col = i % 8;
  return { x: col * 143 + (row % 2) * 39 - 60, y: 332 + row * row * 7.7, width: 16 + row * 7 + (i * 13 % 29) };
});

export function WaterMarks() {
  return <g fill="none" stroke="var(--sc-water-line)" strokeLinecap="round">
    {MARKS.map(({ x,y,width }, i) => <path key={i} d={`M${x} ${y}h${width}`} strokeWidth={i < 24 ? 1.5 : 2.3} />)}
    <path d="M35 497h74m19 0h31m647 0h94M-20 589h85m121 0h44m548 0h80M332 735h42m156 0h82m42 0h48" strokeWidth="3" />
  </g>;
}
