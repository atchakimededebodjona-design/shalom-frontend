import api from './api';

// Module La Bible — appels vers /api/v1/bible.
export const bibleService = {
  listVersions: async () => (await api.get('/bible/versions')).data,
  listBooks: async () => (await api.get('/bible/books')).data,
  getChapter: async (bookId, chapterNumber, version) =>
    (await api.get(`/bible/books/${bookId}/chapters/${chapterNumber}`, { params: { version } })).data,
  search: async (q, version) => (await api.get('/bible/search', { params: { q, version } })).data,
};
