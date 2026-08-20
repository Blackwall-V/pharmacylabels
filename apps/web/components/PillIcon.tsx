// A small original capsule glyph -- gives search results a "catalog" rhythm
// without needing real product photography we don't have rights to.
export function PillIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <rect
        x="3.5"
        y="9.5"
        width="17"
        height="8"
        rx="4"
        transform="rotate(-32 12 13.5)"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M9.8 8.2 L14.2 18.8"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
