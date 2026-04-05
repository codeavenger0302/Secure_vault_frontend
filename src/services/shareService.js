import api from './api';

export const shareService = {
  async createShare(fileId, userId, password, expiryDays, downloadLimit) {
    const res = await api.post('/share/addshare', {
      file_id: fileId,
      user_id: userId,
      password,
      expiry_days: expiryDays,
      download_limit: downloadLimit,
    });
    return res.data;
  },

  async getSharedFile(shareLink, password) {
    const res = await api.get('/share/getshare', {
      params: { share_link: shareLink, password },
      responseType: 'blob',
    });
    return res;
  },

  // Send file directly via SMTP email from backend
  async emailShare(fileId, userId, recipientEmail, senderName, fileName) {
    const res = await api.post('/share/emailshare', {
      file_id: fileId,
      user_id: userId,
      recipient_email: recipientEmail,
      sender_name: senderName || '',
      file_name: fileName || '',
    });
    return res.data;
  },

  // Share file with a SecureVault user by username or email
  async userShare(fileId, userId, recipient, senderName, fileName) {
    const res = await api.post('/share/usershare', {
      file_id: fileId,
      user_id: userId,
      recipient,
      sender_name: senderName || '',
      file_name: fileName || '',
    });
    return res.data;
  },

  // Get shares sent to current user (by email and/or user_id)
  async getSharedWithMe(email, userId) {
    const params = {};
    if (email) params.email = email;
    if (userId) params.user_id = userId;
    const res = await api.get('/share/shared-with-me', { params });
    return res.data;
  },

  // Get shares created by a user
  async getMyShares(userId) {
    const res = await api.get('/share/my-shares', {
      params: { user_id: userId },
    });
    return res.data;
  },
};
