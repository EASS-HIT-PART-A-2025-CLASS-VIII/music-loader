import { useState, useEffect } from 'react'
import './App.css'
import  { enableAudio, ToneExample, stopPlayback, setTempo } from "./Tone.jsx";

function App() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStyle, setSelectedStyle] = useState('')
  const [selectedInstrument, setSelectedInstrument] = useState('')
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('title')
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')
  const [uploadForm, setUploadForm] = useState({
    title: '',
    composer: '',
    instruments: '',
    style: '',
    opus: '',
    date_of_composition: '',
    pdf_file: null
  })
  const [uploadLoading, setUploadLoading] = useState(false)
  const [loadingPieceId, setLoadingPieceId] = useState(null)
  const [playingPieceId, setPlayingPieceId] = useState(null)
  const [tempo, setTempoValue] = useState(120)
  const [mousePosition, setMousePosition] = useState({ x: 0 })

  const styles = ['Baroque', 'Classical', 'Romantic', 'Renaissance', 'Modern', 'Jazz', 'Folk', 'Song']
  const instruments = ['Piano', 'Violin', 'Cello', 'Flute', 'Guitar', 'Voice', 'Clarinet', 'Saxophone']

  const handleSearch = async (query) => {
    if (!query) {
      return
    }

    setLoading(true)
    try {
      let endpoint
      if (activeTab === 'title') {
        endpoint = `/pieces/title/${query}`
      } else if (activeTab === 'style') {
        endpoint = `/pieces/styles/${query}`
      } else if (activeTab === 'play') {
        endpoint = `/pieces/get_notes_with_ai/${query}`
      } else {
        endpoint = `/pieces/instruments/${query}`
      }
      const response = await fetch(endpoint)
      const data = await response.json()
      setResults(data)
    } catch (error) {
      console.error('Error fetching data:', error)
      setResults({ error: 'Failed to fetch results' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (activeTab === 'title') {
      const timeoutId = setTimeout(() => {
        handleSearch(searchQuery)
      }, 500)
      return () => clearTimeout(timeoutId)
    }
  }, [searchQuery, activeTab])

  useEffect(() => {
    if (activeTab === 'style' && selectedStyle) {
      handleSearch(selectedStyle)
    }
  }, [selectedStyle, activeTab])

  useEffect(() => {
    if (activeTab === 'instrument' && selectedInstrument) {
      handleSearch(selectedInstrument)
    }
  }, [selectedInstrument, activeTab])

  const handleUploadSubmit = async (e) => {
    e.preventDefault()
    setUploadLoading(true)

    try {
      const formData = new FormData()
      formData.append('title', uploadForm.title)
      formData.append('composer', uploadForm.composer)
      formData.append('instruments', uploadForm.instruments ? uploadForm.instruments : "unknown")
      formData.append('style', uploadForm.style ? uploadForm.style : "unknown")
      formData.append('opus', uploadForm.opus ? uploadForm.opus : "unknown")
      formData.append('date_of_composition', uploadForm.date_of_composition)
      formData.append('source', 'user_uploaded')
      if (uploadForm.pdf_file) {
        formData.append('pdf_file', uploadForm.pdf_file)
      }

      const response = await fetch('/pieces', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        alert('Sheet uploaded successfully!')
        setShowUploadModal(false)
        setUploadForm({
          title: '',
          composer: '',
          instruments: '',
          style: '',
          opus: '',
          date_of_composition: '',
          source: '',
          pdf_file: null
        })
      } else {
        alert('Failed to upload sheet')
      }
    } catch (error) {
      console.error('Error uploading sheet:', error)
      alert('Error uploading sheet')
    } finally {
      setUploadLoading(false)
    }
  }



  const handlePlaySongById = async (piece_id) => {
    // Stop any currently playing piece before starting a new one.
    if (playingPieceId && playingPieceId !== piece_id) {
      stopPlayback()
      setPlayingPieceId(null)
    }

    setLoadingPieceId(piece_id)
    setStatusMessage("Please wait while the notes are detected... starting soon")

    try {
      const responsePiece = await fetch(`/pieces/get_notes_with_ai/${piece_id}`, {
        method: 'GET'
      })

      if (responsePiece.ok) {
        const pieceData = await responsePiece.json()
        const notesRaw = pieceData?.notes ?? pieceData
        const notes = typeof notesRaw === 'string' ? JSON.parse(notesRaw) : notesRaw
        if (!notes) {
          console.error('No notes found in response', pieceData)
          setPlayingPieceId(null)
          return
        }
        setPlayingPieceId(piece_id)
        const instruments =
  typeof pieceData.instruments === "string"
    ? pieceData.instruments.toLowerCase()
    : "unknown";
    
        ToneExample(notes, instruments, tempo)
      } else {
        alert('Failed to get notes with AI')
      }
    } catch (error) {
      console.error('Error getting notes with AI:', error)
      alert('Error getting notes with AI')
      setPlayingPieceId(null)
    } finally {
      setLoadingPieceId(null)
      setStatusMessage('')
    }
  }

  return (
    <>
    <img src="https://www.clipartmax.com/png/middle/1-11041_g-key-clef-clip-treble-clef-clip-art.png" alt="G Key Clef Clip - Treble Clef Clip Art@clipartmax.com" style={{ width: '100px', height: '100px', objectFit: 'cover' }}></img>

      <h1>Music Loader</h1>
      
      <button
        onClick={() => setShowUploadModal(true)}
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          padding: '12px 24px',
          backgroundColor: '#28a745',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          fontSize: '16px',
          fontWeight: 'bold',
          cursor: 'pointer',
          zIndex: 1000
        }}
      >
        ➕ Add Your Sheet
      </button>

      {showUploadModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 2000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '10px',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <h2 style={{ marginTop: 0, color: '#333' }}>Add Your Music Sheet</h2>
            <form onSubmit={handleUploadSubmit}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>Title *</label>
                <input type="text" required value={uploadForm.title} onChange={(e) => setUploadForm({...uploadForm, title: e.target.value})} onInvalid={(e) => e.target.setCustomValidity('Please enter the title')} onInput={(e) => e.target.setCustomValidity('')} style={{ width: '100%', padding: '8px', borderRadius: '5px', border: '1px solid #ccc' }} />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>Composer *</label>
                <input type="text" required value={uploadForm.composer} onChange={(e) => setUploadForm({...uploadForm, composer: e.target.value})} onInvalid={(e) => e.target.setCustomValidity('Please enter the composer name')} onInput={(e) => e.target.setCustomValidity('')} style={{ width: '100%', padding: '8px', borderRadius: '5px', border: '1px solid #ccc' }} />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>Instruments</label>
                <input type="text" value={uploadForm.instruments} onChange={(e) => setUploadForm({...uploadForm, instruments: e.target.value ? e.target.value : "unknown"})} style={{ width: '100%', padding: '8px', borderRadius: '5px', border: '1px solid #ccc' }} />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>Style</label>
                <input type="text" value={uploadForm.style} onChange={(e) => setUploadForm({...uploadForm, style: e.target.value ? e.target.value : "unknown"})} style={{ width: '100%', padding: '8px', borderRadius: '5px', border: '1px solid #ccc' }} />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>Opus</label>
                <input type="text" value={uploadForm.opus} onChange={(e) => setUploadForm({...uploadForm, opus: e.target.value ? e.target.value : "unknown"})} style={{ width: '100%', padding: '8px', borderRadius: '5px', border: '1px solid #ccc' }} />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>Date of Composition</label>
                <input type="text" value={uploadForm.date_of_composition} onChange={(e) => setUploadForm({...uploadForm, date_of_composition: e.target.value ? e.target.value : "unknown"})} style={{ width: '100%', padding: '8px', borderRadius: '5px', border: '1px solid #ccc' }} />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>PDF File *</label>
                <input type="file" accept=".pdf" required onChange={(e) => setUploadForm({...uploadForm, pdf_file: e.target.files[0]})} onInvalid={(e) => e.target.setCustomValidity('Please select a PDF file')} onInput={(e) => e.target.setCustomValidity('')} style={{ width: '100%', padding: '8px', borderRadius: '5px', border: '1px solid #ccc' }} />
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowUploadModal(false)} style={{ padding: '10px 20px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={uploadLoading} style={{ padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: uploadLoading ? 'not-allowed' : 'pointer' }}>{uploadLoading ? 'Uploading...' : 'Upload'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="card">
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <button 
            onClick={() => setActiveTab('title')} 
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect()
              setMousePosition({ x: e.clientX - rect.left })
            }}
            style={{ 
              padding: '10px 20px', 
              fontSize: '16px', 
              borderRadius: '5px', 
              border: activeTab === 'title' ? '2px solid #646cff' : '1px solid #ccc', 
              backgroundColor: activeTab === 'title' ? '#646cff' : 'transparent', 
              color: activeTab === 'title' ? 'white' : 'inherit', 
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              transform: 'scale(1)',
              boxShadow: activeTab === 'title' ? '0 4px 15px rgba(100, 108, 255, 0.4)' : 'none',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'scale(1.05) translateY(-2px)'
              e.target.style.boxShadow = '0 6px 20px rgba(100, 108, 255, 0.5)'
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1) translateY(0)'
              e.target.style.boxShadow = activeTab === 'title' ? '0 4px 15px rgba(100, 108, 255, 0.4)' : 'none'
            }}
          >
            <span style={{
              position: 'absolute',
              top: '-20%',
              left: `${mousePosition.x}px`,
              width: '120px',
              height: '140%',
              background: 'radial-gradient(ellipse 60px 100% at center, rgba(147, 51, 234, 0.9) 0%, rgba(147, 51, 234, 0.5) 30%, rgba(147, 51, 234, 0) 60%)',
              transform: 'translateX(-50%)',
              pointerEvents: 'none',
              filter: 'blur(18px)',
              transition: 'left 0.05s ease-out'
            }}></span>
            <span style={{ position: 'relative', zIndex: 1 }}>Search for a Piece</span>
          </button>
          <button 
            onClick={() => setActiveTab('style')} 
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect()
              setMousePosition({ x: e.clientX - rect.left })
            }}
            style={{ 
              padding: '10px 20px', 
              fontSize: '16px', 
              borderRadius: '5px', 
              border: activeTab === 'style' ? '2px solid #646cff' : '1px solid #ccc', 
              backgroundColor: activeTab === 'style' ? '#646cff' : 'transparent', 
              color: activeTab === 'style' ? 'white' : 'inherit', 
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              transform: 'scale(1)',
              boxShadow: activeTab === 'style' ? '0 4px 15px rgba(100, 108, 255, 0.4)' : 'none',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'scale(1.05) translateY(-2px)'
              e.target.style.boxShadow = '0 6px 20px rgba(100, 108, 255, 0.5)'
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1) translateY(0)'
              e.target.style.boxShadow = activeTab === 'style' ? '0 4px 15px rgba(100, 108, 255, 0.4)' : 'none'
            }}
          >
            <span style={{
              position: 'absolute',
              top: '-20%',
              left: `${mousePosition.x}px`,
              width: '120px',
              height: '140%',
              background: 'radial-gradient(ellipse 60px 100% at center, rgba(147, 51, 234, 0.9) 0%, rgba(147, 51, 234, 0.5) 30%, rgba(147, 51, 234, 0) 60%)',
              transform: 'translateX(-50%)',
              pointerEvents: 'none',
              filter: 'blur(18px)',
              transition: 'left 0.05s ease-out'
            }}></span>
            <span style={{ position: 'relative', zIndex: 1 }}>Browse by Style</span>
          </button>
          <button 
            onClick={() => setActiveTab('instrument')} 
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect()
              setMousePosition({ x: e.clientX - rect.left })
            }}
            style={{ 
              padding: '10px 20px', 
              fontSize: '16px', 
              borderRadius: '5px', 
              border: activeTab === 'instrument' ? '2px solid #646cff' : '1px solid #ccc', 
              backgroundColor: activeTab === 'instrument' ? '#646cff' : 'transparent', 
              color: activeTab === 'instrument' ? 'white' : 'inherit', 
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              transform: 'scale(1)',
              boxShadow: activeTab === 'instrument' ? '0 4px 15px rgba(100, 108, 255, 0.4)' : 'none',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'scale(1.05) translateY(-2px)'
              e.target.style.boxShadow = '0 6px 20px rgba(100, 108, 255, 0.5)'
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1) translateY(0)'
              e.target.style.boxShadow = activeTab === 'instrument' ? '0 4px 15px rgba(100, 108, 255, 0.4)' : 'none'
            }}
            >
            <span style={{
              position: 'absolute',
              top: '-20%',
              left: `${mousePosition.x}px`,
              width: '120px',
              height: '140%',
              background: 'radial-gradient(ellipse 60px 100% at center, rgba(147, 51, 234, 0.9) 0%, rgba(147, 51, 234, 0.5) 30%, rgba(147, 51, 234, 0) 60%)',
              transform: 'translateX(-50%)',
              pointerEvents: 'none',
              filter: 'blur(18px)',
              transition: 'left 0.05s ease-out'
            }}></span>
            <span style={{ position: 'relative', zIndex: 1 }}>Browse by Instrument</span>
            </button>
          </div>

          <h2>{activeTab === 'title' && 'Search for a Piece'}{activeTab === 'style' && 'Browse by Style'}{activeTab === 'instrument' && 'Browse by Instrument'}</h2>
          
          {activeTab === 'title' ? (
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <input type="text" placeholder="Search for music..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ padding: '10px', fontSize: '16px', width: '300px', borderRadius: '5px', border: '1px solid #ccc' }} />
            </div>
          ) : activeTab === 'style' ? (
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <label style={{ fontWeight: 'bold' }}>Select a style:</label>
            {styles.map((style) => (
              <button key={style} onClick={() => setSelectedStyle(style)} style={{ padding: '8px 16px', fontSize: '14px', borderRadius: '5px', border: selectedStyle === style ? '2px solid #646cff' : '1px solid #ccc', backgroundColor: selectedStyle === style ? '#646cff' : 'transparent', color: selectedStyle === style ? 'white' : 'inherit', cursor: 'pointer' }}>{style}</button>
            ))}
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <label style={{ fontWeight: 'bold' }}>Select an instrument:</label>
            {instruments.map((instrument) => (
              <button key={instrument} onClick={() => setSelectedInstrument(instrument)} style={{ padding: '8px 16px', fontSize: '14px', borderRadius: '5px', border: selectedInstrument === instrument ? '2px solid #646cff' : '1px solid #ccc', backgroundColor: selectedInstrument === instrument ? '#646cff' : 'transparent', color: selectedInstrument === instrument ? 'white' : 'inherit', cursor: 'pointer' }}>{instrument}</button>
            ))}
            </div>
          )}
          
          {results && (
            <div style={{ marginTop: '20px', textAlign: 'left' }}>
            {results.error ? (
              <p style={{ color: 'red' }}>{results.error}</p>
            ) : (
              <>
              <h3>Found {results.length} pieces</h3>
              <div style={{ display: 'grid', gap: '15px' }}>
                {results.map((piece) => (
                <div key={piece._id} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px', backgroundColor: '#000000ff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
                  {playingPieceId === piece._id && loadingPieceId !== piece._id && (
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    pointerEvents: 'none',
                    zIndex: 8
                  }}>
                    <div style={{
                      backgroundColor: 'rgba(0, 0, 0, 0.65)',
                      color: 'white',
                      padding: '10px 18px',
                      borderRadius: '10px',
                      fontWeight: 'bold',
                      fontSize: '16px'
                    }}>
                      Playing
                    </div>
                  </div>
                )}
                  {loadingPieceId === piece._id && (
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderRadius: '8px',
                    zIndex: 10
                  }}>
                    <div style={{
                    width: '60px',
                    height: '60px',
                    border: '6px solid #f3f3f3',
                    borderTop: '6px solid #646cff',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                    }}></div>
                    {statusMessage && (
                    <p style={{ color: 'white', marginTop: '20px', fontSize: '14px', textAlign: 'center', maxWidth: '80%' }}>
                      {statusMessage}
                    </p>
                    )}
                    <style>
                    {`
                      @keyframes spin {
                      0% { transform: rotate(0deg); }
                      100% { transform: rotate(360deg); }
                      }
                    `}
                    </style>
                  </div>
                  )}
                  <div style={{ flex: 1 }}>
                  <h4 style={{ margin: '0 0 10px 0' }}> {piece.title}</h4>
                  <p><strong>Composer:</strong> {piece.composer}</p>
                    <p><strong>Style:</strong> {piece.style}</p>
                    <p><strong>Instruments:</strong> {piece.instruments}</p>
                    {piece.opus && <p><strong>Opus:</strong> {piece.opus}</p>}
                    <a href={piece.pdf_url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', padding: '8px 16px', backgroundColor: '#646cff', color: 'white', textDecoration: 'none', borderRadius: '5px', fontWeight: 'bold', marginTop: '10px', transition: 'background-color 0.3s' }} onMouseEnter={(e) => e.target.style.backgroundColor = '#4f5acf'} onMouseLeave={(e) => e.target.style.backgroundColor = '#646cff'}>📄 View PDF</a>
                    <button
                      onClick={async () => {
                              if (playingPieceId === piece._id && loadingPieceId !== piece._id) {
                                stopPlayback()
                                setPlayingPieceId(null)
                                setStatusMessage('')
                                return
                              }
                              await enableAudio();
                              await handlePlaySongById(piece._id);
                            }}
                          disabled={loadingPieceId === piece._id}
                          style={{ marginLeft: '10px', padding: '8px 16px', backgroundColor: (playingPieceId === piece._id && loadingPieceId !== piece._id) ? '#dc3545' : '#28a745', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: loadingPieceId === piece._id ? 'not-allowed' : 'pointer', marginTop: '10px', transition: 'background-color 0.3s', opacity: loadingPieceId === piece._id ? 0.7 : 1 }} onMouseEnter={(e) => e.target.style.backgroundColor = (playingPieceId === piece._id && loadingPieceId !== piece._id) ? '#c82333' : '#218838'} onMouseLeave={(e) => e.target.style.backgroundColor = (playingPieceId === piece._id && loadingPieceId !== piece._id) ? '#dc3545' : '#28a745'}>
                            {loadingPieceId === piece._id
                              ? 'Loading...'
                              : playingPieceId === piece._id
                                ? 'Stop'
                                : '▶️ Play with AI'}
                          </button>
                          {(loadingPieceId === piece._id || playingPieceId === piece._id) && (
                            <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <label style={{ color: 'white', fontWeight: 'bold' }}>Tempo:</label>
                              <input
                                type="range"
                                min="40"
                                max="200"
                                step="1"
                                value={tempo}
                                onChange={(e) => {
                                  const newTempo = Number(e.target.value)
                                  setTempoValue(newTempo)
                                  setTempo(newTempo)
                                }}
                                style={{ flex: 1 }}
                              />
                              <span style={{ color: 'white', minWidth: '40px', textAlign: 'right' }}>{tempo} BPM</span>
                            </div>
                          )}
                      </div>
                      <img src={piece.image_url || "https://picsum.photos/200/200?random=1"} alt={piece.title} style={{ width: '180px', height: '180px', objectFit: 'cover', flexShrink: 0, marginLeft: '20px', borderRadius: '8px' }} />
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </>
  )
}

export default App
