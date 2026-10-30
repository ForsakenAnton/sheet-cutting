/**
 * A cup of coffee: the “Buy me a coffee” buttons. With `steam` the steam is wavy and can rise
 * (`.coffee-steam` in index.css), otherwise it is two still lines.
 */
export function CoffeeIcon({
  size,
  strokeWidth = 1.8,
  steam = false,
}: {
  size: number;
  strokeWidth?: number;
  steam?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {steam ? (
        <>
          <path className="coffee-steam" d="M8.5 7c-1.1-1.3 1.1-2 0-3.5" />
          <path className="coffee-steam" d="M12 7c-1.1-1.3 1.1-2 0-3.5" />
        </>
      ) : (
        <path d="M8 3.5v3M12 3.5v3" />
      )}
      <path d="M4 9.5h12v4a5.5 5.5 0 0 1-5.5 5.5h-1A5.5 5.5 0 0 1 4 13.5zM16 11h1.5a2.5 2.5 0 0 1 0 5H16M3 21.5h14" />
    </svg>
  );
}
