export default function Spinner({ size = 24, className = '' }) {
  const px = typeof size === 'number' ? `${size}px` : size;
  return (
    <div className={`w-full flex justify-center items-center py-6 ${className}`}>
      <span className="loading loading-spinner" style={{ width: px, height: px }} />
    </div>
  );
}

