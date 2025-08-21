export default function CheckBadge({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`h-5 w-5 ${className}`} aria-hidden>
      <path fill="currentColor" d="M12 2a10 10 0 1 0 .001 20.001A10 10 0 0 0 12 2Zm-1.1 13.7-3.6-3.6 1.4-1.4 2.2 2.2 5-5 1.4 1.4-6.4 6.4Z"/>
    </svg>
  );
}
