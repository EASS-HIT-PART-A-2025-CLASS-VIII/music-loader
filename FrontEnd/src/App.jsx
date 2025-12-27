import { useState, useEffect, useCallback } from 'react'
import './App.css'
import { Tabs } from './components/Tabs.jsx'
import { SearchControls } from './components/SearchControls.jsx'
import { UploadModal } from './components/UploadModal.jsx'
import { ResultsList } from './components/ResultsList.jsx'
import { api, normalizeList } from './api.js'
import { useLookupList } from './hooks/useLookupList.js'
import { usePlayback } from './hooks/usePlayback.js'

const DEFAULT_STYLES = ['Baroque', 'Classical', 'Romantic', 'Renaissance', 'Modern', 'Jazz', 'Folk', 'Song']
const DEFAULT_INSTRUMENTS = ['Piano', 'Violin', 'Cello', 'Flute', 'Guitar', 'Voice', 'Clarinet', 'Saxophone']
const DEFAULT_COMPOSERS = ['Bach', 'Mozart', 'Beethoven', 'Chopin']

function App() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStyle, setSelectedStyle] = useState('')
  const [selectedComposer, setSelectedComposer] = useState('')
  const [selectedInstrument, setSelectedInstrument] = useState('')
  const [styles, setStyles] = useState(DEFAULT_STYLES)
  const [instruments, setInstruments] = useState(DEFAULT_INSTRUMENTS)
  const [composers, setComposers] = useState(DEFAULT_COMPOSERS)
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('title')
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [composerInfo, setComposerInfo] = useState(null)
  const [composerInfoLoading, setComposerInfoLoading] = useState(false)
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
  const [mousePosition, setMousePosition] = useState({ x: 0 })

  const {
    loadingPieceId,
    playingPieceId,
    tempo,
    setTempoValue,
    statusMessage,
    play,
    stopPlayback
  } = usePlayback()

  const fetchStyles = useCallback(
    () => api.getStyles().then((data) => normalizeList(data, ['styles', 'name', 'style'])),
    []
  )

  const fetchInstruments = useCallback(
    () => api.getInstruments().then((data) => normalizeList(data, ['instruments', 'name', 'instrument'])),
    []
  )

  const fetchComposers = useCallback(
    () => api.getComposers().then((data) => normalizeList(data, ['composers', 'name', 'composer'])),
    []
  )

  useLookupList({
    activeTab,
    tabKey: 'style',
    fetcher: fetchStyles,
    setter: setStyles
  })

  useLookupList({
    activeTab,
    tabKey: 'instrument',
    fetcher: fetchInstruments,
    setter: setInstruments
  })

  useLookupList({
    activeTab,
    tabKey: 'composer',
    fetcher: fetchComposers,
    setter: setComposers
  })

  const handleSearch = async (query) => {
    if (!query) return
    setLoading(true)
    try {
      const searchers = {
        title: api.searchByTitle,
        style: api.searchByStyle,
        composer: api.searchByComposer,
        instrument: api.searchByInstrument
      }
      const searchFn = searchers[activeTab] || api.searchByInstrument
      const data = await searchFn(query)
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
    } else if (activeTab === 'style' && !selectedStyle) {
      setResults(null)
    }
  }, [selectedStyle, activeTab])

  useEffect(() => {
    if (activeTab === 'composer' && selectedComposer) {
      handleSearch(selectedComposer)
    } else if (activeTab === 'composer' && !selectedComposer) {
      setResults(null)
      setComposerInfo(null)
    }
  }, [selectedComposer, activeTab])

  useEffect(() => {
    if (activeTab === 'instrument' && selectedInstrument) {
      handleSearch(selectedInstrument)
    } else if (activeTab === 'instrument' && !selectedInstrument) {
      setResults(null)
    }
  }, [selectedInstrument, activeTab])

  const handleUploadSubmit = async (e) => {
    e.preventDefault()
    setUploadLoading(true)

    try {
      const formData = new FormData()
      formData.append('title', uploadForm.title)
      formData.append('composer', uploadForm.composer)
      formData.append('instruments', uploadForm.instruments ? uploadForm.instruments : 'unknown')
      formData.append('style', uploadForm.style ? uploadForm.style : 'unknown')
      formData.append('opus', uploadForm.opus ? uploadForm.opus : 'unknown')
      formData.append('date_of_composition', uploadForm.date_of_composition)
      formData.append('source', 'user_uploaded')
      if (uploadForm.pdf_file) {
        formData.append('pdf_file', uploadForm.pdf_file)
      }

      await api.uploadPiece(formData)
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
    } catch (error) {
      console.error('Error uploading sheet:', error)
      alert('Error uploading sheet')
    } finally {
      setUploadLoading(false)
    }
  }

  const handleComposerInfo = async () => {
    if (!selectedComposer) return
    setComposerInfoLoading(true)
    try {
      const data = await api.getComposerInfo(selectedComposer)
      setComposerInfo(data)
    } catch (error) {
      console.error('Error fetching composer info:', error)
      setComposerInfo(null)
    } finally {
      setComposerInfoLoading(false)
    }
  }

  const handlePlayToggle = (pieceId) => {
    if (playingPieceId === pieceId && !loadingPieceId) {
      stopPlayback()
      return
    }
    play(pieceId)
  }

  return (
    <>
      <div className="atmosphere" aria-hidden="true">
        <div className="staff"></div>
        <div className="bar-lines"></div>
        <span className="note n1">♪</span>
        <span className="note n2">♩</span>
        <span className="note n3">♫</span>
        <span className="note n4">𝄞</span>
        <span className="note n5">♬</span>
        <span className="note n6">♩</span>
        <span className="note n7">♪</span>
        <span className="note n8">♩</span>
        <span className="note n9">♫</span>
        <span className="note n10">♬</span>
      </div>
      <div className="hero">
        <img className="logo-mark" src="https://www.clipartmax.com/png/middle/1-11041_g-key-clef-clip-treble-clef-clip-art.png" alt="G Key Clef Clip - Treble Clef Clip Art@clipartmax.com" />
        <div>
          <p className="eyebrow">Discover · Upload · Play</p>
          <h1>Music Loader</h1>
          <p className="subhead">Find pieces by title, style, composer or instrument, upload your own PDFs, and play them instantly with AI-backed playback.</p>
        </div>
      </div>
      
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

      <UploadModal
        show={showUploadModal}
        uploadForm={uploadForm}
        setUploadForm={setUploadForm}
        uploadLoading={uploadLoading}
        onClose={() => setShowUploadModal(false)}
        onSubmit={handleUploadSubmit}
      />

      <div className="card">
        <Tabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          mousePosition={mousePosition}
          setMousePosition={setMousePosition}
        />

        <h2>
          {activeTab === 'title' && 'Search for a Piece'}
          {activeTab === 'style' && 'Browse by Style'}
          {activeTab === 'composer' && 'Browse by Composer'}
          {activeTab === 'instrument' && 'Browse by Instrument'}
        </h2>
        
        <SearchControls
          activeTab={activeTab}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          styles={styles}
          selectedStyle={selectedStyle}
          setSelectedStyle={setSelectedStyle}
          composers={composers}
          selectedComposer={selectedComposer}
          setSelectedComposer={setSelectedComposer}
          onComposerInfo={handleComposerInfo}
          composerInfoLoading={composerInfoLoading}
          instruments={instruments}
          selectedInstrument={selectedInstrument}
          setSelectedInstrument={setSelectedInstrument}
        />

        {activeTab === 'composer' && selectedComposer && composerInfo && (
          <div style={{ marginTop: '12px', padding: '12px', background: 'rgba(255,255,255,0.06)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            {composerInfo.image_url && (
              <img src={composerInfo.image_url} alt={selectedComposer} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '10px', flexShrink: 0 }} />
            )}
            <div style={{ textAlign: 'left', color: '#e7edf7' }}>
              <h4 style={{ margin: '0 0 6px 0' }}>{selectedComposer}</h4>
              <p style={{ margin: 0, fontSize: '14px' }}>{composerInfo.info || 'No info available.'}</p>
            </div>
          </div>
        )}
        
        {loading && <p>Loading...</p>}

        <ResultsList
          results={results}
          loadingPieceId={loadingPieceId}
          playingPieceId={playingPieceId}
          statusMessage={statusMessage}
          tempo={tempo}
          onTempoChange={(val) => setTempoValue(val)}
          onPlayToggle={handlePlayToggle}
        />
      </div>
    </>
  )
}

export default App
