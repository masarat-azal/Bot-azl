export default function Logo({ size = 42, watermark = false }) {
  const stroke = watermark ? "#D4A72C" : "#D4A72C";
  const fill = watermark ? "none" : "#0B3B35";
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} style={{ flexShrink: 0 }}>
      <circle cx="50" cy="50" r="48" fill={fill} stroke={stroke} strokeWidth="2.5" />
      <path d="M28 32 Q38 55 50 68" stroke="#D4A72C" strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d="M50 26 Q50 48 50 68" stroke="#E2B83D" strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d="M72 32 Q62 55 50 68" stroke="#D4A72C" strokeWidth="5" fill="none" strokeLinecap="round" />
      <circle cx="50" cy="71" r="4.5" fill="#E2B83D" />
    </svg>
  );
}
