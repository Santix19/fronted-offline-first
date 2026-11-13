/** The broad inlet continues past the first landscape; both banks meet at y=860. The forest starts a little higher so no light seam shows. */
export function StoryRiver({ foreground = false }: { foreground?: boolean }) {
  return <g className="lg-river" transform="translate(0 860)">
    {!foreground && <rect y="-3" width="1000" height="2303" fill="var(--sc-water)" />}
    <path d="M0 0H115C113 155 157 253 105 420S39 650 92 800 121 1020 75 1180 137 1420 96 1600 42 1940 102 2300H0Z" fill="var(--sc-bank)" />
    <path d="M1000 0H935C962 157 891 301 928 480S885 750 933 930 888 1230 934 1430 901 1820 947 2300H1000Z" fill="var(--sc-marsh)" />
    <path d="M0-3H46V0C39 160 99 257 51 423S-19 650 31 810 54 1020 16 1180 78 1430 42 1600-8 1950 46 2300H0Z" fill="var(--sc-forest)" />
    <g fill="var(--sc-rock)">
      <path d="m69 128 21-15 22 11 3 24-30 9-19-12Zm-11 15-9-13-14 3-2 21 19 7Zm862 170 25-12 16 18-7 27-29 2-14-18ZM67 686l23-8 12 16-5 21-32 7-13-17Zm883 133 20-17 24 14-3 25-28 8-16-12Z" />
    </g>
    <g stroke="var(--sc-sedge-light)" strokeWidth="3" fill="none">
      <path d="m22 240 8-34m-8 34-10-23m15 32 13-20m930-94-8-28m8 28 12-20M28 610l8-35m-8 35-11-22m958 0-10-31m10 31 12-19M31 919l8-31m-8 31-10-20m945 7 12-32m-12 32-8-21" />
    </g>
  </g>;
}
