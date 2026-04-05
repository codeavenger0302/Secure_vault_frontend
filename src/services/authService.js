import api from './api';

export const authService = {
  async signup(username, email, password) {
    const res = await api.post('/auth/signup', { username, email, password });
    return res.data;
  },

  async signin(email, password) {
    const res = await api.post('/auth/signin', { email, password });
    return res.data;
  },
};
