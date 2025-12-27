const API_BASE = '';

async function fetchJson(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, options);
  const raw = await response.text();
  if (!response.ok) {
    throw new Error(raw || `Request failed: ${response.status}`);
  }
  try {
    return JSON.parse(raw);
  } catch (err) {
    throw new Error(`Invalid JSON response: ${raw?.slice(0, 120) || 'empty'}`);
  }
}

export const api = {
  searchByTitle: (query) => fetchJson(`/pieces/search/${query}`),
  searchByStyle: (query) => fetchJson(`/pieces/styles/${query}`),
  searchByInstrument: (query) => fetchJson(`/pieces/instruments/${query}`),
  searchByComposer: (query) => fetchJson(`/pieces/composers/${query}`),
  getNotes: (pieceId) => fetchJson(`/pieces/get_notes_with_ai/${pieceId}`),
  uploadPiece: (formData) =>
    fetchJson('/pieces', {
      method: 'POST',
      body: formData
    }),
  getStyles: () => fetchJson('/styles'),
  getInstruments: () => fetchJson('/instruments'),
  getComposers: () => fetchJson('/composers'),
  getComposerInfo: (name) => fetchJson(`/composer/info/${encodeURIComponent(name)}`)
};

export function normalizeList(data, keys = []) {
  const raw = Array.isArray(data)
    ? data
    : keys.find((key) => Array.isArray(data?.[key])) 
      ? data[keys.find((key) => Array.isArray(data?.[key]))]
      : [];

  return raw
    .map((item) => {
      if (typeof item === 'string') return item;
      for (const key of keys) {
        if (typeof item?.[key] === 'string') return item[key];
      }
      return null;
    })
    .filter(Boolean)
    .map((s) => String(s).replace(/\//g, ' / '));
}
