export function UploadModal({
  show,
  uploadForm,
  setUploadForm,
  uploadLoading,
  onClose,
  onSubmit
}) {
  if (!show) return null;

  return (
    <div
      style={{
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
      }}
    >
      <div
        style={{
          backgroundColor: 'white',
          padding: '30px',
          borderRadius: '10px',
          maxWidth: '500px',
          width: '90%',
          maxHeight: '90vh',
          overflow: 'auto'
        }}
      >
        <h2 style={{ marginTop: 0, color: '#333' }}>Add Your Music Sheet</h2>
        <form onSubmit={onSubmit}>
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
            <button type="button" onClick={onClose} style={{ padding: '10px 20px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Cancel</button>
            <button type="submit" disabled={uploadLoading} style={{ padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: uploadLoading ? 'not-allowed' : 'pointer' }}>{uploadLoading ? 'Uploading...' : 'Upload'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
