/**
 * HumanSignedBadge — fingerprint icon indicating device passkey signature.
 * Gold = signed with passkey. Dimmed = no passkey.
 * No text. No explanation. People ask what it means.
 */

interface HumanSignedBadgeProps {
  signed: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizes = {
  sm: { box: 24, icon: 11 },
  md: { box: 36, icon: 16 },
  lg: { box: 52, icon: 24 },
} as const;

export default function HumanSignedBadge({ signed, size = 'sm', className = '' }: HumanSignedBadgeProps) {
  const { icon } = sizes[size];
  const stroke = signed ? '#C9A96E' : 'rgba(201, 169, 110, 0.25)';

  return (
    <div
      className={className}
      title={signed ? 'Human signed — anchored with device passkey' : 'No device signature'}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <svg
        width={icon}
        height={icon}
        viewBox="0 0 24 24"
        fill="none"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4" />
        <path d="M14 13.12c0 2.38 0 6.38-1 8.88" />
        <path d="M17.29 21.02c.12-.6.43-2.3.5-3.02" />
        <path d="M2 12a10 10 0 0 1 18-6" />
        <path d="M2 16h.01" />
        <path d="M21.8 16c.2-2 .131-5.354 0-6" />
        <path d="M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2" />
        <path d="M8.65 22c.21-.66.45-1.32.57-2" />
        <path d="M9 6.8a6 6 0 0 1 9 5.2v2" />
      </svg>
    </div>
  );
}
