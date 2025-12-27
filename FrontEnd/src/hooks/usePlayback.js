import { useEffect, useRef, useState } from 'react';
import {
  enableAudio,
  ToneExample,
  stopPlayback as stopAudio,
  setTempo as setToneTempo
} from '../Tone.jsx';
import { api } from '../api';

export function usePlayback() {
  const [loadingPieceId, setLoadingPieceId] = useState(null);
  const [playingPieceId, setPlayingPieceId] = useState(null);
  const [tempo, setTempoState] = useState(120);
  const tempoRef = useRef(tempo);
  const [statusMessage, setStatusMessage] = useState('');

  const setTempoValue = (nextTempo) => {
    setTempoState((prevTempo) => {
      const value = typeof nextTempo === 'function' ? nextTempo(prevTempo) : nextTempo;
      tempoRef.current = value;
      return value;
    });
  };

  useEffect(() => {
    tempoRef.current = tempo;
  }, [tempo]);

  useEffect(() => {
    if (!playingPieceId) return;
    setToneTempo(tempo);
  }, [playingPieceId, tempo]);

  const stopPlayback = () => {
    stopAudio();
    setPlayingPieceId(null);
    setStatusMessage('');
  };

  const play = async (pieceId) => {
    if (playingPieceId && playingPieceId !== pieceId) {
      stopPlayback();
    }

    setLoadingPieceId(pieceId);
    setStatusMessage('Please wait while the notes are detected... starting soon');

    try {
      await enableAudio();
      const pieceData = await api.getNotes(pieceId);
      const notesRaw = pieceData?.notes ?? pieceData;
      const notes = typeof notesRaw === 'string' ? JSON.parse(notesRaw) : notesRaw;
      if (!notes) {
        console.error('No notes found in response', pieceData);
        setPlayingPieceId(null);
        return;
      }
      setPlayingPieceId(pieceId);
      const instruments =
        typeof pieceData.instruments === 'string'
          ? pieceData.instruments.toLowerCase()
          : 'unknown';
      ToneExample(notes, instruments, tempoRef.current);
    } catch (error) {
      console.error('Error getting notes with AI:', error);
      alert('Error getting notes with AI');
      setPlayingPieceId(null);
    } finally {
      setLoadingPieceId(null);
      setStatusMessage('');
    }
  };

  return {
    loadingPieceId,
    playingPieceId,
    tempo,
    setTempoValue,
    statusMessage,
    play,
    stopPlayback
  };
}
