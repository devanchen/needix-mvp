// components/icons/BrandIcon.tsx
import React from "react";

export type Brand =
  | "Netflix"
  | "Spotify"
  | "Amazon Prime"
  | "Xbox Game Pass"
  | "YouTube Premium"
  | "Disney+"
  | "Crunchyroll";

const BRANDS: Brand[] = [
  "Netflix",
  "Spotify",
  "Amazon Prime",
  "Xbox Game Pass",
  "YouTube Premium",
  "Disney+",
  "Crunchyroll",
];

export function isBrand(name: string): name is Brand {
  return BRANDS.includes(name as Brand);
}

export default function BrandIcon({
  name,
  className = "w-4 h-4",
}: {
  name: Brand;
  className?: string;
}) {
  switch (name) {
    case "Netflix":
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden>
          <rect width="24" height="24" rx="4" fill="#111" />
          <path d="M8 3h3.2l4.8 18H12.8L8 3zm3.2 0H16v18h-2.4L11.2 3z" fill="#E50914" />
        </svg>
      );
    case "Spotify":
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden>
          <rect width="24" height="24" rx="4" fill="#111" />
          <path d="M12 4a8 8 0 100 16 8 8 0 000-16zm3.3 10.9a.8.8 0 01-1.1.3c-2.9-1.8-6.6-2-10-.7a.8.8 0 01-.6-1.5c3.8-1.5 7.9-1.3 11.2.8.4.3.6.8.3 1.1zm1.6-2.6a.9.9 0 01-1.2.3c-3.3-2-8-2.6-11.7-1.1a.9.9 0 01-.7-1.7C7.4 8.2 12.7 8.9 16.5 11c.4.2.5.8.4 1.3zm.2-2.9c-3.8-2.2-9.8-2.4-13.2-1a1 1 0 11-.8-1.8c4-1.7 10.7-1.5 15 1.1a1 1 0 01-1 1.7z" fill="#1DB954" />
        </svg>
      );
    case "Amazon Prime":
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden>
          <rect width="24" height="24" rx="4" fill="#111" />
          <path d="M4 14.5c3.9 2.3 9.5 2.6 15 0-.8.9-2.5 2.3-3.6 3 .4.5 2.1.6 3.5.2-2.1 1.9-5.6 2.7-8.7 2.1-2.6-.5-4.5-1.9-6.2-4.1z" fill="#00A8E1"/>
          <path d="M7 7.5h3.5c1.3 0 2.2.8 2.2 2 0 1.3-.9 2-2.2 2H9.2v1.8H7V7.5zm2.2 1.6v.9h1c.4 0 .7-.2.7-.5 0-.3-.3-.4-.7-.4h-1zM15.4 7.5H18v5.8h-1.8V12h-1c-1.3 0-2.3-.8-2.3-2s1-2.5 2.5-2.5zm.8 1.6c-.4 0-.8.3-.8.8s.4.8.8.8h.9V9.1h-.9z" fill="#fff"/>
        </svg>
      );
    case "Xbox Game Pass":
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden>
          <rect width="24" height="24" rx="4" fill="#111" />
          <path d="M12 4c4.4 0 8 3.6 8 8s-3.6 8-8 8-8-3.6-8-8 3.6-8 8-8z" fill="#107C10" />
          <path d="M12 7c1.2 1.3 2.7 1.9 4.2 2.1-.4 2.7-2.1 5.2-4.2 6.8C9.9 14.3 8.2 11.8 7.8 9c1.5-.2 3-.8 4.2-2z" fill="#fff"/>
        </svg>
      );
    case "YouTube Premium":
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden>
          <rect width="24" height="24" rx="4" fill="#111" />
          <rect x="5" y="8" width="14" height="8" rx="2" fill="#FF0000" />
          <path d="M11 10.5L14 12l-3 1.5v-3z" fill="#fff"/>
        </svg>
      );
    case "Disney+":
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden>
          <rect width="24" height="24" rx="4" fill="#111" />
          <path d="M4 14a8 8 0 0116 0" stroke="#1E90FF" strokeWidth="2" fill="none"/>
          <path d="M8 15h2v2H8zM11 15h2v2h-2zM14 15h2v2h-2z" fill="#1E90FF"/>
        </svg>
      );
    case "Crunchyroll":
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden>
          <rect width="24" height="24" rx="4" fill="#111" />
          <path d="M12 5a7 7 0 105.7 11.3A6 6 0 1112 5z" fill="#F47521"/>
          <circle cx="16.5" cy="11.5" r="2.2" fill="#111"/>
        </svg>
      );
    default:
      return null;
  }
}
