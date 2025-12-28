import { useState } from 'react';

export function PieceCard({
  piece,
  isLoading,
  isPlaying,
  statusMessage,
  onPlayToggle,
  tempo,
  onTempoChange,
  onComposerInfo,
  composerInfo,
  composerInfoLoading
}) {
  const showTempo = isLoading || isPlaying;
  const buttonDisabled = isLoading;
  const buttonLabel = isLoading ? 'Loading...' : isPlaying ? 'Stop' : '▶️ Play with AI';
  const buttonColor = isPlaying ? '#dc3545' : '#28a745';
  const buttonHover = isPlaying ? '#c82333' : '#218838';
  const [showComposerInfo, setShowComposerInfo] = useState(false);
  const hasComposer = Boolean(piece?.composer);
  const composerButtonDisabled = composerInfoLoading || !hasComposer;
  const composerButtonLabel = composerInfoLoading
    ? 'Loading...'
    : showComposerInfo
      ? 'Hide Info'
      : 'Composer Info';

  const handleComposerInfoClick = () => {
    if (!hasComposer) return;
    setShowComposerInfo((prev) => {
      const next = !prev;
      const needsFetch = !composerInfo || composerInfo?.error;
      if (next && needsFetch && !composerInfoLoading) {
        onComposerInfo?.();
      }
      return next;
    });
  };

  return (
    <div className="piece-card">
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
      <div className="piece-card__body">
        <div className="piece-card__meta">
          {piece.style && <span className="pill">{piece.style}</span>}
          {piece.instruments && <span className="pill">{piece.instruments}</span>}
          {piece.opus && <span className="pill">Opus {piece.opus}</span>}
        </div>
        <h2 className="piece-card__title">{piece.title}</h2>
        <p className="piece-card__composer">by {piece.composer}</p>
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
        <button
          onClick={handleComposerInfoClick}
          disabled={composerButtonDisabled}
          style={{
            marginLeft: '10px',
            padding: '8px 16px',
            backgroundColor: '#1f2e53',
            color: '#f4f7ff',
            border: '1px solid rgba(143, 180, 255, 0.6)',
            borderRadius: '5px',
            fontWeight: 'bold',
            cursor: composerButtonDisabled ? 'not-allowed' : 'pointer',
            marginTop: '10px',
            transition: 'background-color 0.3s',
            opacity: composerButtonDisabled ? 0.7 : 1
          }}
          onMouseEnter={(e) => {
            if (!composerButtonDisabled) e.target.style.backgroundColor = '#26376a';
          }}
          onMouseLeave={(e) => (e.target.style.backgroundColor = '#1f2e53')}
        >
          {composerButtonLabel}
        </button>
        {showComposerInfo && (
          <div className="piece-card__composer-info">
            {composerInfoLoading && (
              <p className="piece-card__composer-status">Loading composer info...</p>
            )}
            {!composerInfoLoading && composerInfo?.error && (
              <p className="piece-card__composer-status">{composerInfo.error}</p>
            )}
            {!composerInfoLoading && composerInfo && !composerInfo.error && (
              <>
                {composerInfo.image_url && (
                  <img
                    src={composerInfo.image_url}
                    alt={piece.composer}
                    className="piece-card__composer-image"
                  />
                )}
                <div>
                  <h4 className="piece-card__composer-name">{piece.composer}</h4>
                  <p className="piece-card__composer-text">
                    {composerInfo.info || 'No info available.'}
                  </p>
                </div>
              </>
            )}
          </div>
        )}
        {showTempo && (
          <div className="piece-card__tempo">
            <label>Tempo:</label>
            <input
              type="range"
              min="40"
              max="200"
              step="1"
              value={tempo}
              onChange={(e) => onTempoChange(Number(e.target.value))}
            />
            <span>{tempo} BPM</span>
          </div>
        )}
      </div>
      <img
        src={piece.image_url || 'https://picsum.photos/200/200?random=1'}
        alt={piece.title}
        className="piece-card__image"
      />
    </div>
  );
}
