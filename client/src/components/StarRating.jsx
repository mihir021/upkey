export default function StarRating({ rating = 0, max = 5, size = 16, showNum = false }) {
  const full  = Math.floor(rating);
  const half  = rating - full >= 0.3;
  const empty = max - full - (half ? 1 : 0);

  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:2 }}>
      {Array.from({ length: full }).map((_, i) => (
        <svg key={`f${i}`} width={size} height={size} viewBox="0 0 24 24" fill="#E8633A" stroke="none">
          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
        </svg>
      ))}
      {half && (
        <svg key="h" width={size} height={size} viewBox="0 0 24 24" stroke="none">
          <defs>
            <linearGradient id="hg">
              <stop offset="50%" stopColor="#E8633A"/>
              <stop offset="50%" stopColor="#EADFD4"/>
            </linearGradient>
          </defs>
          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" fill="url(#hg)"/>
        </svg>
      )}
      {Array.from({ length: empty }).map((_, i) => (
        <svg key={`e${i}`} width={size} height={size} viewBox="0 0 24 24" fill="#EADFD4" stroke="none">
          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
        </svg>
      ))}
      {showNum && (
        <span style={{ fontSize: size * 0.85, color: '#665D57', marginLeft: 4 }}>
          {rating.toFixed(1)}
        </span>
      )}
    </span>
  );
}
