import api from './api';

export const storageService = {
  // Core file operations
  async uploadFile(file, userid, filename, folderId = null) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userid', userid);
    formData.append('filename', filename || file.name);
    if (folderId) formData.append('folder_id', folderId);

    const res = await api.post('/store/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  async listFiles(userid, folderId = null) {
    const params = { userid };
    if (folderId) params.folder_id = folderId;
    else params.all = 'true';
    const res = await api.get('/store/listfiles', { params });
    return res.data;
  },

  async getFile(userid, fileId) {
    const res = await api.get('/store/getfile', {
      params: { userid, file_id: fileId },
      responseType: 'blob',
    });
    return res;
  },

  // Trash operations
  async trashFile(userid, fileId) {
    const res = await api.post('/store/trash', { userid, file_id: fileId });
    return res.data;
  },

  async restoreFile(userid, fileId) {
    const res = await api.post('/store/restore', { userid, file_id: fileId });
    return res.data;
  },

  async listTrash(userid) {
    const res = await api.get('/store/trash', { params: { userid } });
    return res.data;
  },

  async permanentDelete(userid, fileId) {
    const res = await api.post('/store/permanent-delete', { userid, file_id: fileId });
    return res.data;
  },

  // Folder operations
  async createFolder(userId, name, parentId = null) {
    const res = await api.post('/store/folders', {
      user_id: userId,
      name,
      parent_id: parentId,
    });
    return res.data;
  },

  async listFolders(userid, parentId = null) {
    const params = { userid };
    if (parentId) params.parent_id = parentId;
    else params.all = 'true';
    const res = await api.get('/store/folders', { params });
    return res.data;
  },

  async deleteFolder(userId, folderId) {
    const res = await api.delete('/store/folders', {
      data: { user_id: userId, folder_id: folderId },
    });
    return res.data;
  },

  async renameFolder(userId, folderId, name) {
    const res = await api.put('/store/folders/rename', {
      user_id: userId,
      folder_id: folderId,
      name,
    });
    return res.data;
  },

  // File management
  async moveFile(userid, fileId, folderId) {
    const res = await api.put('/store/move', {
      userid,
      file_id: fileId,
      folder_id: folderId || null,
    });
    return res.data;
  },

  async renameFile(userid, fileId, newName) {
    const res = await api.put('/store/rename', {
      userid,
      file_id: fileId,
      new_name: newName,
    });
    return res.data;
  },

  async getFileVersions(userid, filename) {
    const res = await api.get('/store/versions', {
      params: { userid, filename },
    });
    return res.data;
  },

  async checkDuplicate(userid, hash) {
    const res = await api.get('/store/check-duplicate', {
      params: { userid, hash },
    });
    return res.data;
  },

  // Activity & Stats
  async getActivityLog(userid, limit = 50) {
    const res = await api.get('/store/activity', {
      params: { userid, limit },
    });
    return res.data;
  },

  async getStorageStats(userid) {
    const res = await api.get('/store/stats', {
      params: { userid },
    });
    return res.data;
  },

  // Health
  async healthCheck() {
    const res = await api.get('/health');
    return res.data;
  },
};
