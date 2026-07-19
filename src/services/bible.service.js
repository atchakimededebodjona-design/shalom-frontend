import api from './api';

// Module La Bible — appels vers /api/v1/bible.
export const bibleService = {
  listBooks: async () => (await api.get('/bible/books')).data,
  getChapter: async (bookId, chapterNumber) =>
    (await api.get(`/bible/books/${bookId}/chapters/${chapterNumber}`)).data,
  search: async (q) => (await api.get('/bible/search', { params: { q } })).data,
};
