/** The inlet and near shore from the first reference: connected land, boardwalk and small houses. */
export function StoryShore() {
  return <g className="lg-near-shore">
    <path d="M0 528q64 17 119 7 59-4 90 20 16 29-3 61-36 53-60 99-30 62-31 145H0Z" fill="var(--sc-bank)" />
    <path d="M1000 533q-64-9-113 4-51-3-62 38-18 48 22 100 66 80 88 185h65Z" fill="var(--sc-marsh)" />
    <path d="M155 551q50 11 43 43-4 29-31 74-52 79-69 192H74q22-123 71-201 28-43 31-64 5-20-29-27Z" fill="var(--sc-path)" />
    <path d="M0 638q42-3 73 23 25 38-4 96-26 51-23 103H0Z" fill="var(--sc-forest)" />
    <path d="M837 572q-20 41-2 74 24 41 43 66M907 805l25 55" stroke="var(--sc-reed)" strokeWidth="9" fill="none" />
    <g stroke="var(--sc-sedge-light)" strokeWidth="3" fill="none">
      <path d="m837 572-2-23m12 17 5-26m6 20 1-18m12 9 5-25m8 19 3-25m12 19 6-23m12 19 1-26m12 22 5-24m12 18 4-23" />
      <path d="m833 631-5-31m14 19-2-24m7 12 6-33m4 19 1-28M880 743l-2-23m14 32 2-24m12 30 7-24m4 31 8-26m-6 44 10-23" />
    </g>
    <g transform="translate(50 0)" stroke="var(--sc-wood-dark)" strokeWidth="3" strokeLinejoin="round">
      <path d="m96 546 79 10-6 31-79-14Z" fill="var(--sc-wood)" />
      <path d="m99 554 72 10m-74 1 72 10m-66-27-6 28m28-25-6 30m30-27-6 29" fill="none" />
      <path d="M111 570v30m49-24v29" fill="none" />
      <path d="m62 532 29-22 35 9-7 36-49-5Z" fill="var(--sc-house)" />
      <path d="m56 531 34-28 41 12-7 11-32-8-24 20Z" fill="var(--sc-roof)" />
      <path d="m78 550 2-15 11 2-2 14m9-15 11 2-1 10-11-2Z" fill="var(--sc-wood-dark)" />
      <path d="m7 599 24-26 45 13-5 40-61-9Z" fill="var(--sc-house)" />
      <path d="m0 598 31-33 52 17-8 12-43-12-23 23Z" fill="var(--sc-roof)" />
      <path d="m29 619 2-20 14 4-2 19m13-17 12 3-1 11-12-3Z" fill="var(--sc-wood-dark)" />
    </g>
    <g className="lg-boat" fill="var(--sc-boat)" stroke="var(--sc-wood-dark)" strokeWidth="3">
      <path d="m217 548 35 6-6 13q-20 6-38-7Z" />
      <path d="m218 545 26 4-3-12-16-3Z" fill="var(--sc-house)" />
      <path d="m215 558 29 4" fill="none" />
    </g>
  </g>;
}
