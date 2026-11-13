/** Two ridgelines leave visible sky and water around the island. No blurred or animated backdrop. */
export function Mountains() {
  return <>
    <path d="M0 238 34 222 63 225 93 207 129 215 152 200 178 211 211 195 244 207 271 194 310 204 339 190 370 201 399 194 423 210 451 199 480 216 513 199 540 208 568 189 600 207 628 202 652 216 683 196 714 211 744 202 771 216 801 195 828 203 854 191 881 207 913 198 946 214 972 208 1000 222V328H0Z" fill="var(--sc-mountain-far)" />
    <path d="M0 266q51-8 87-25l47 11 38-15 38 10 45-18 46 13 29-9 56 22 51-12 40 17 54-11 57 26 48-14 44 13 44-16 43 14 44-19 41 11 46-16 57 23H1000V321H0Z" fill="var(--sc-mountain)" />
    <path d="M0 282h49m23-5h39m46-5h32m586 9h54m29-8h48m28 9h66" stroke="var(--sc-mountain-far)" strokeWidth="3" fill="none" />
  </>;
}
