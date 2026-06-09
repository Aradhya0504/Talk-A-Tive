export default function Avatar({ name = '', src = '', size = 36, online = false }) {
  const initials = name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();

  const gradients = [
    'linear-gradient(135deg,#818cf8,#6366f1)',
    'linear-gradient(135deg,#a78bfa,#818cf8)',
    'linear-gradient(135deg,#22d3ee,#6366f1)',
    'linear-gradient(135deg,#f472b6,#a78bfa)',
    'linear-gradient(135deg,#34d399,#22d3ee)',
    'linear-gradient(135deg,#fb923c,#f472b6)',
    'linear-gradient(135deg,#818cf8,#22d3ee)',
    'linear-gradient(135deg,#a78bfa,#f472b6)',
  ];
  const bg = gradients[name.charCodeAt(0) % gradients.length] || gradients[0];

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      {/* Outer glow ring when online */}
      {online && (
        <div className="absolute inset-0 rounded-full"
          style={{
            background: 'var(--gradient-brand)',
            padding: 2,
            boxShadow: '0 0 12px rgba(129,140,248,0.5)',
          }} />
      )}

      <div className="absolute rounded-full overflow-hidden"
        style={{
          inset: online ? 2 : 0,
          background: src ? undefined : bg,
        }}>
        {src
          ? <img src={src} alt={name} className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center font-bold select-none"
              style={{ color: 'white', fontSize: size * 0.37 }}>
              {initials || '?'}
            </div>
        }
      </div>

      {/* Online dot + pulse */}
      {online && (
        <span className="absolute" style={{ bottom: 0, right: 0, width: size * 0.3, height: size * 0.3 }}>
          <span className="online-pulse absolute inset-0 rounded-full" />
          <span className="absolute inset-0 rounded-full"
            style={{
              background: 'var(--online)',
              border: `2px solid var(--bg-primary)`,
              boxShadow: '0 0 6px var(--online)',
            }} />
        </span>
      )}
    </div>
  );
}
