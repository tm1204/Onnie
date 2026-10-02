// Small inline icons that inherit the button's text colour (unlike arrow/bin characters,
// which some systems draw as coloured emoji).
const base = {
  viewBox: "0 0 24 24",
  width: 18,
  height: 18,
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2.4,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export const ArrowUpIcon = () => (
  <svg {...base}>
    <path d="M12 19V5M5 12l7-7 7 7" />
  </svg>
);
export const ArrowDownIcon = () => (
  <svg {...base}>
    <path d="M12 5v14M19 12l-7 7-7-7" />
  </svg>
);
export const TrashIcon = () => (
  <svg {...base}>
    <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
  </svg>
);
export const UndoIcon = () => (
  <svg {...base}>
    <path d="M9 14 4 9l5-5M4 9h10a6 6 0 0 1 0 12h-3" />
  </svg>
);
