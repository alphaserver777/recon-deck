import type { MapRoleKey } from "@/lib/mock-data";

export function MapRoleIcon({ role, size = 20 }: { role: MapRoleKey; size?: number }) {
  const common = {
    xmlns: "http://www.w3.org/2000/svg",
    width: size,
    height: size,
    viewBox: "0 0 16 16",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  switch (role) {
    case "dc":
      return (
        <svg {...common}>
          <path d="M2 11.5h12L15 4.5l-3.5 3L8 2.5 4.5 7.5 1 4.5l1 7z" fill="currentColor" stroke="none" />
          <line x1="2" y1="13" x2="14" y2="13" strokeWidth="1.5" stroke="currentColor" />
        </svg>
      );
    case "mssql":
      return (
        <svg {...common}>
          <ellipse cx="8" cy="3.5" rx="5.5" ry="2" />
          <path d="M2.5 3.5v9c0 1.1 2.5 2 5.5 2s5.5-.9 5.5-2v-9" />
          <path d="M2.5 8c0 1.1 2.5 2 5.5 2s5.5-.9 5.5-2" />
        </svg>
      );
    case "ilo":
      return (
        <svg {...common}>
          <rect x="4" y="4" width="8" height="8" rx="1.5" />
          <line x1="6" y1="1" x2="6" y2="4" />
          <line x1="10" y1="1" x2="10" y2="4" />
          <line x1="6" y1="12" x2="6" y2="15" />
          <line x1="10" y1="12" x2="10" y2="15" />
          <line x1="1" y1="6" x2="4" y2="6" />
          <line x1="1" y1="10" x2="4" y2="10" />
          <line x1="12" y1="6" x2="15" y2="6" />
          <line x1="12" y1="10" x2="15" y2="10" />
        </svg>
      );
    case "backup":
      return (
        <svg {...common}>
          <rect x="1.5" y="3.5" width="13" height="9" rx="2" />
          <circle cx="11" cy="8" r="2" />
          <line x1="3.5" y1="6" x2="7" y2="6" />
          <line x1="3.5" y1="8.5" x2="6" y2="8.5" />
        </svg>
      );
    case "printer":
      return (
        <svg {...common}>
          <path d="M4.5 1.5h7v3.5h-7z" />
          <path d="M1.5 5h13v6h-13z" />
          <path d="M4.5 9.5h7v5h-7z" />
        </svg>
      );
    case "camera":
      return (
        <svg {...common}>
          <path d="M1.5 4.5h3l1-2h5l1 2h3v9h-13z" />
          <circle cx="8" cy="9" r="2.5" />
          <circle cx="8" cy="9" r="0.8" fill="currentColor" stroke="none" />
        </svg>
      );
    case "windows":
      return (
        <svg {...common}>
          <rect x="2" y="1.5" width="12" height="9" rx="1" />
          <line x1="8" y1="10.5" x2="8" y2="13" />
          <line x1="5" y1="13.5" x2="11" y2="13.5" />
        </svg>
      );
    case "exchange":
      return (
        <svg {...common}>
          <rect x="2" y="2" width="12" height="12" rx="1.5" />
          <path d="M5 5h6M5 8h4M5 11h5" strokeWidth="1.3" />
          <circle cx="12" cy="4" r="2" fill="currentColor" stroke="none" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <rect x="2.5" y="1" width="11" height="4" rx="0.8" />
          <rect x="2.5" y="6" width="11" height="4" rx="0.8" />
          <rect x="2.5" y="11" width="11" height="4" rx="0.8" />
          <circle cx="11" cy="3" r="0.8" fill="currentColor" stroke="none" />
          <circle cx="11" cy="8" r="0.8" fill="currentColor" stroke="none" />
          <circle cx="11" cy="13" r="0.8" fill="currentColor" stroke="none" />
        </svg>
      );
  }
}
