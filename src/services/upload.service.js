import api from './api';

export const uploadService = {
  // POST /uploads (multipart) → { data: { url, mimetype, size } }
  uploadFile: async (file, onProgress) => {
    const form = new FormData();
    form.append('file', file);
    const response = await api.post('/uploads', form, {
      // Content-Type à undefined : le navigateur pose multipart/form-data + boundary
      headers: { 'Content-Type': undefined },
      onUploadProgress: (e) => {
        if (onProgress && e.total) onProgress(Math.round((e.loaded / e.total) * 100));
      },
    });
    return response.data;
  },
};
