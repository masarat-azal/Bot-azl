export default function Logo({ size = 42, watermark = false }) {
  return (
    <img
      src="/images/logo.png"
      alt="مسارات أزل"
      width={size}
      height={size}
      style={{
        flexShrink: 0,
        objectFit: "contain",
        filter: watermark
          ? "drop-shadow(0 0 6px rgba(212,167,44,.35))"
          : "drop-shadow(0 2px 6px rgba(0,0,0,.35))",
      }}
    />
  );
}
