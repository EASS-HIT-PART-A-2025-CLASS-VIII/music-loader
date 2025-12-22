export function PieceCard({
  piece,
  isLoading,
  isPlaying,
  statusMessage,
  onPlayToggle,
  tempo,
  onTempoChange
}) {
  const showTempo = isLoading || isPlaying;
  const buttonDisabled = isLoading;
  const buttonLabel = isLoading ? 'Loading...' : isPlaying ? 'Stop' : '▶️ Play with AI';
  const buttonColor = isPlaying ? '#dc3545' : '#28a745';
  const buttonHover = isPlaying ? '#c82333' : '#218838';

  return (
    <div
      style={{
        border: '1px solid #ddd',
        padding: '15px',
        borderRadius: '8px',
        backgroundColor: '#000000ff',
        display: 'flex',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        gap: '20px',
        position: 'relative'
      }}
    >
      {isPlaying && !isLoading && (
        <div className="overlay-label">
          <div className="overlay-label__badge">Playing</div>
        </div>
      )}
      {isLoading && (
        <div className="overlay-spinner">
          <div className="spinner"></div>
          {statusMessage && (
            <p className="overlay-spinner__message">
              {statusMessage}
            </p>
          )}
        </div>
      )}
      <div style={{ flex: 1, textAlign: 'left' }}>
        <h2 style={{ margin: '0 0 10px 0' }}>{piece.title}</h2>
        <p><strong>Composer:</strong> {piece.composer}</p>
        <p><strong>Style:</strong> {piece.style}</p>
        <p><strong>Instruments:</strong> {piece.instruments}</p>
        {piece.opus && <p><strong>Opus:</strong> {piece.opus}</p>}
        <a
          href={piece.pdf_url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-block',
            padding: '8px 16px',
            backgroundColor: '#646cff',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '5px',
            fontWeight: 'bold',
            marginTop: '10px',
            transition: 'background-color 0.3s'
          }}
          onMouseEnter={(e) => (e.target.style.backgroundColor = '#4f5acf')}
          onMouseLeave={(e) => (e.target.style.backgroundColor = '#646cff')}
        >
          📄 View PDF
        </a>
        <button
          onClick={onPlayToggle}
          disabled={buttonDisabled}
          style={{
            marginLeft: '10px',
            padding: '8px 16px',
            backgroundColor: buttonColor,
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            fontWeight: 'bold',
            cursor: buttonDisabled ? 'not-allowed' : 'pointer',
            marginTop: '10px',
            transition: 'background-color 0.3s',
            opacity: buttonDisabled ? 0.7 : 1
          }}
          onMouseEnter={(e) => (e.target.style.backgroundColor = buttonHover)}
          onMouseLeave={(e) => (e.target.style.backgroundColor = buttonColor)}
        >
          {buttonLabel}
        </button>
        {showTempo && (
          <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label style={{ color: 'white', fontWeight: 'bold' }}>Tempo:</label>
            <input
              type="range"
              min="40"
              max="200"
              step="1"
              value={tempo}
              onChange={(e) => onTempoChange(Number(e.target.value))}
              style={{ flex: 1 }}
            />
            <span style={{ color: 'white', minWidth: '40px', textAlign: 'right' }}>{tempo} BPM</span>
          </div>
        )}
      </div>
      <img
        src={piece.image_url || 'https://picsum.photos/200/200?random=1'}
        alt={piece.title}
        style={{ width: '180px', height: '180px', objectFit: 'cover', flexShrink: 0, marginLeft: '20px', borderRadius: '8px' }}
      />
    </div>
  );
}
