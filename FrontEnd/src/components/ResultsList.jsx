import { PieceCard } from './PieceCard.jsx';

export function ResultsList({
  results,
  loadingPieceId,
  playingPieceId,
  statusMessage,
  tempo,
  onTempoChange,
  onPlayToggle,
  onComposerInfo,
  composerInfoByName,
  composerInfoLoadingByName
}) {
  if (!results) return null;
  if (results.error) {
    return <p style={{ color: 'red' }}>{results.error}</p>;
  }

  return (
    <>
      <h3>Found {results.length} pieces</h3>
      <div style={{ display: 'grid', gap: '15px' }}>
        {results.map((piece) => {
          const composerKey = piece.composer?.trim()
          return (
            <PieceCard
              key={piece._id}
              piece={piece}
              isLoading={loadingPieceId === piece._id}
              isPlaying={playingPieceId === piece._id}
              statusMessage={statusMessage}
              tempo={tempo}
              onTempoChange={onTempoChange}
              onPlayToggle={() => onPlayToggle(piece._id)}
              composerInfo={composerKey ? composerInfoByName?.[composerKey] : null}
              composerInfoLoading={composerKey ? composerInfoLoadingByName?.[composerKey] : false}
              onComposerInfo={() => onComposerInfo?.(composerKey)}
            />
          )
        })}
      </div>
    </>
  );
}
