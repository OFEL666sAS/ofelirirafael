interface TikTokIconProps {
  className?: string;
}

export function TikTokIcon({ className }: TikTokIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M16.5 3c.32 2.1 1.5 3.58 3.5 3.9v2.42c-1.2 0-2.32-.3-3.42-.9v6.06c0 3.1-2.5 5.62-5.6 5.62S5.38 17.58 5.38 14.48c0-2.86 2.14-5.24 4.98-5.58v2.6c-1.32.3-2.3 1.48-2.3 2.9 0 1.66 1.34 3 3 3s3-1.34 3-3V3h2.44z" />
    </svg>
  );
}
