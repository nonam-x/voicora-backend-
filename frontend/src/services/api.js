import api from '../lib/axios'

// ======================== AUTH ========================

export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/me'),
}

// ======================== POLLS ========================

export const pollApi = {
  create: (data) => api.post('/polls', data),
  getMyPolls: () => api.get('/polls/mine'),
  getById: (id) => api.get(`/polls/${id}`),
  getBySlug: (slug) => api.get(`/polls/public/${slug}`),
  update: (id, data) => api.put(`/polls/${id}`, data),
  activate: (id) => api.patch(`/polls/${id}/activate`),
  close: (id) => api.patch(`/polls/${id}/close`),
  publishResults: (id) => api.patch(`/polls/${id}/publish-results`),
  delete: (id) => api.delete(`/polls/${id}`),
}

// ======================== RESPONSES ========================

export const responseApi = {
  submit: (pollId, data) => api.post(`/responses/${pollId}`, data),
  getAll: (pollId) => api.get(`/responses/${pollId}`),
  getAnalytics: (pollId) => api.get(`/responses/${pollId}/analytics`),
}
