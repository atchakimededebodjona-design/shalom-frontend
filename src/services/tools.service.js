import api from './api';

// Module Outils pratiques du quotidien — appels vers /api/v1/tools.
export const toolsService = {
  // --- Dîme / offrandes ---
  listTithes: async (params = {}) => (await api.get('/tools/tithe', { params })).data,
  createTithe: async (body) => (await api.post('/tools/tithe', body)).data,
  updateTithe: async (id, body) => (await api.patch(`/tools/tithe/${id}`, body)).data,
  deleteTithe: async (id) => (await api.delete(`/tools/tithe/${id}`)).data,

  // --- Événements personnels ---
  listEvents: async (params = {}) => (await api.get('/tools/personal-events', { params })).data,
  createEvent: async (body) => (await api.post('/tools/personal-events', body)).data,
  updateEvent: async (id, body) => (await api.patch(`/tools/personal-events/${id}`, body)).data,
  deleteEvent: async (id) => (await api.delete(`/tools/personal-events/${id}`)).data,

  // --- Listes de tâches ---
  listLists: async () => (await api.get('/tools/task-lists')).data,
  createList: async (body) => (await api.post('/tools/task-lists', body)).data,
  getList: async (id) => (await api.get(`/tools/task-lists/${id}`)).data,
  updateList: async (id, body) => (await api.patch(`/tools/task-lists/${id}`, body)).data,
  deleteList: async (id) => (await api.delete(`/tools/task-lists/${id}`)).data,
  reorderTasks: async (id, orderedIds) =>
    (await api.patch(`/tools/task-lists/${id}/reorder`, { ordered_ids: orderedIds })).data,

  // --- Tâches ---
  createTask: async (body) => (await api.post('/tools/tasks', body)).data,
  updateTask: async (id, body) => (await api.patch(`/tools/tasks/${id}`, body)).data,
  deleteTask: async (id) => (await api.delete(`/tools/tasks/${id}`)).data,

  // --- Convertisseur ---
  listUnits: async () => (await api.get('/tools/units')).data,
  convert: async (body) => (await api.post('/tools/units/convert', body)).data,
  conversionHistory: async () => (await api.get('/tools/units/history')).data,
};
