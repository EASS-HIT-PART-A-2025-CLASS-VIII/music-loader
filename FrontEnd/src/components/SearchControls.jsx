export function SearchControls({
  activeTab,
  searchQuery,
  setSearchQuery,
  styles,
  selectedStyle,
  setSelectedStyle,
  composers,
  selectedComposer,
  setSelectedComposer,
  onComposerInfo,
  composerInfoLoading,
  instruments,
  selectedInstrument,
  setSelectedInstrument
}) {
  if (activeTab === 'title') {
    return (
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', justifyContent: 'center' }}>
        <input
          type="text"
          placeholder="Search for music..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            padding: '10px',
            fontSize: '16px',
            width: '300px',
            borderRadius: '5px',
            border: '1px solid #ccc'
          }}
        />
      </div>
    );
  }

  if (activeTab === 'style') {
    return (
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
        <label style={{ fontWeight: 'bold' }}>Select a style:</label>
        {styles.map((style) => (
          <button
            key={style}
            onClick={() => setSelectedStyle(selectedStyle === style ? '' : style)}
            style={{
              padding: '8px 16px',
              fontSize: '14px',
              borderRadius: '5px',
              border: selectedStyle === style ? '2px solid #646cff' : '1px solid #ccc',
              backgroundColor: selectedStyle === style ? '#646cff' : 'transparent',
              color: selectedStyle === style ? 'white' : 'inherit',
              cursor: 'pointer'
            }}
          >
            {style}
          </button>
        ))}
      </div>
    );
  }

  if (activeTab === 'composer') {
    return (
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
        <label style={{ fontWeight: 'bold' }}>Select a composer:</label>
        {composers.map((composer) => (
          <button
            key={composer}
            onClick={() => setSelectedComposer(selectedComposer === composer ? '' : composer)}
            style={{
              padding: '8px 16px',
              fontSize: '14px',
              borderRadius: '5px',
              border: selectedComposer === composer ? '2px solid #646cff' : '1px solid #ccc',
              backgroundColor: selectedComposer === composer ? '#646cff' : 'transparent',
              color: selectedComposer === composer ? 'white' : 'inherit',
              cursor: 'pointer'
            }}
          >
            {composer}
          </button>
        ))}
        {selectedComposer && (
          <button
            onClick={onComposerInfo}
            disabled={composerInfoLoading}
            style={{
              padding: '10px 18px',
              fontSize: '15px',
              borderRadius: '10px',
              border: '1px solid #8fb4ff',
              background: 'linear-gradient(145deg, #1f2e53, #26376a)',
              color: '#f4f7ff',
              boxShadow: '0 8px 18px rgba(0,0,0,0.18), 0 0 0 1px rgba(143, 180, 255, 0.35)',
              cursor: composerInfoLoading ? 'not-allowed' : 'pointer',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              fontWeight: 700
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.22), 0 0 0 1px rgba(143, 180, 255, 0.45)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 18px rgba(0,0,0,0.18), 0 0 0 1px rgba(143, 180, 255, 0.35)';
            }}
          >
            {composerInfoLoading ? 'Loading info...' : 'Composer Info'}
          </button>
        )}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
      <label style={{ fontWeight: 'bold' }}>Select an instrument:</label>
      {instruments
        .filter((instrument) => !selectedInstrument || selectedInstrument === instrument)
        .map((instrument) => (
          <button
            key={instrument}
            onClick={() => setSelectedInstrument(selectedInstrument === instrument ? '' : instrument)}
            style={{
              padding: '8px 16px',
              fontSize: '14px',
              borderRadius: '5px',
              border: selectedInstrument === instrument ? '2px solid #646cff' : '1px solid #ccc',
              backgroundColor: selectedInstrument === instrument ? '#646cff' : 'transparent',
              color: selectedInstrument === instrument ? 'white' : 'inherit',
              cursor: 'pointer'
            }}
          >
            {instrument}
          </button>
        ))}
    </div>
  );
}
