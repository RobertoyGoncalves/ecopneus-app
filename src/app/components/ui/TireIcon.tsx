export function TireIcon({ size = 40, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 110 110"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="55" cy="55" r="50" fill="none" stroke="currentColor" strokeWidth="14"/>
      <circle cx="55" cy="55" r="27" fill="none" stroke="currentColor" strokeWidth="3"/>
      <circle cx="55" cy="55" r="9" fill="currentColor"/>
      <line x1="55" y1="28" x2="55" y2="46" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
      <line x1="55" y1="64" x2="55" y2="82" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
      <line x1="28" y1="55" x2="46" y2="55" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
      <line x1="64" y1="55" x2="82" y2="55" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
      <line x1="35" y1="35" x2="46" y2="46" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
      <line x1="64" y1="64" x2="75" y2="75" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
      <line x1="75" y1="35" x2="64" y2="46" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
      <line x1="46" y1="64" x2="35" y2="75" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
    </svg>
  );
}
