export function Tabs({ activeTab, setActiveTab, mousePosition, setMousePosition }) {
  const baseButtonStyle = {
    padding: '10px 20px',
    fontSize: '16px',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    transform: 'scale(1)',
    position: 'relative',
    overflow: 'hidden'
  };

  const tabs = [
    { key: 'title', label: 'Search for a Piece' },
    { key: 'style', label: 'Browse by Style' },
    { key: 'composer', label: 'Browse by Composer' },
    { key: 'instrument', label: 'Browse by Instrument' }
  ];

  return (
    <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', justifyContent: 'center' }}>
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => setActiveTab(tab.key)}
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            setMousePosition({ x: e.clientX - rect.left });
          }}
          style={{
            ...baseButtonStyle,
            border: activeTab === tab.key ? '2px solid #646cff' : '1px solid #ccc',
            backgroundColor: activeTab === tab.key ? '#646cff' : 'transparent',
            color: activeTab === tab.key ? 'white' : 'inherit',
            boxShadow: activeTab === tab.key ? '0 4px 15px rgba(100, 108, 255, 0.4)' : 'none'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'scale(1.05) translateY(-2px)';
            e.target.style.boxShadow = '0 6px 20px rgba(100, 108, 255, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'scale(1) translateY(0)';
            e.target.style.boxShadow =
              activeTab === tab.key ? '0 4px 15px rgba(100, 108, 255, 0.4)' : 'none';
          }}
        >
          <span
            style={{
              position: 'absolute',
              top: '-20%',
              left: `${mousePosition.x}px`,
              width: '120px',
              height: '140%',
              background:
                'radial-gradient(ellipse 60px 100% at center, rgba(147, 51, 234, 0.9) 0%, rgba(147, 51, 234, 0.5) 30%, rgba(147, 51, 234, 0) 60%)',
              transform: 'translateX(-50%)',
              pointerEvents: 'none',
              filter: 'blur(18px)',
              transition: 'left 0.05s ease-out'
            }}
          ></span>
          <span style={{ position: 'relative', zIndex: 1 }}>{tab.label}</span>
        </button>
      ))}
    </div>
  );
}
