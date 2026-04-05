import { useState, useEffect, useCallback } from 'react';
import { storageService } from '../services/storageService';

/**
 * Hook to manage uploaded files — fetches from backend API and merges local AI metadata
 */
export function useFileStore() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  const getLocalMeta = () => {
    try {
      return JSON.parse(localStorage.getItem('fileMeta') || '{}');
    } catch {
      return {};
    }
  };

  const saveLocalMeta = (meta) => {
    localStorage.setItem('fileMeta', JSON.stringify(meta));
  };

  const mergeWithMeta = (apiFiles) => {
    const meta = getLocalMeta();
    return apiFiles.map((f) => ({ ...f, ...(meta[f.id] || {}) }));
  };

  const fetchFiles = useCallback(async () => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    if (!userData.id) {
      setFiles([]);
      setLoading(false);
      return;
    }
    try {
      const data = await storageService.listFiles(userData.id);
      const apiFiles = data.files || [];
      setFiles(mergeWithMeta(apiFiles));
    } catch {
      setFiles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const addFile = (fileData) => {
    // Save AI metadata locally, then refresh from API
    if (fileData.category || fileData.tags || fileData.summary) {
      const meta = getLocalMeta();
      meta[fileData.id] = {
        category: fileData.category,
        tags: fileData.tags,
        summary: fileData.summary,
      };
      saveLocalMeta(meta);
    }
    fetchFiles();
  };

  const removeFile = (fileId) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const updateFile = (fileId, updates) => {
    // Persist AI metadata locally
    const meta = getLocalMeta();
    meta[fileId] = { ...(meta[fileId] || {}), ...updates };
    saveLocalMeta(meta);
    setFiles((prev) => prev.map((f) => (f.id === fileId ? { ...f, ...updates } : f)));
  };

  return { files, loading, addFile, removeFile, updateFile, refetch: fetchFiles };
}
