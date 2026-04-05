import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileIcon } from 'lucide-react';

export default function FileDropzone({ onFileDrop, disabled }) {
  const onDrop = useCallback(
    (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        onFileDrop(acceptedFiles[0]);
      }
    },
    [onFileDrop]
  );

  const { getRootProps, getInputProps, isDragActive, acceptedFiles } = useDropzone({
    onDrop,
    disabled,
    multiple: false,
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-300 ${
        isDragActive
          ? 'border-indigo-400 bg-indigo-500/10'
          : disabled
          ? 'border-gray-700 bg-gray-800/30 cursor-not-allowed'
          : 'border-gray-700 hover:border-indigo-500/50 hover:bg-gray-800/50'
      }`}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-3">
        {acceptedFiles.length > 0 ? (
          <>
            <FileIcon className="w-12 h-12 text-indigo-400" />
            <div>
              <p className="text-lg font-medium text-gray-200">{acceptedFiles[0].name}</p>
              <p className="text-sm text-gray-500">{formatSize(acceptedFiles[0].size)}</p>
            </div>
          </>
        ) : (
          <>
            <Upload className={`w-12 h-12 ${isDragActive ? 'text-indigo-400' : 'text-gray-600'}`} />
            <div>
              <p className="text-lg font-medium text-gray-300">
                {isDragActive ? 'Drop file here...' : 'Drag & drop a file here'}
              </p>
              <p className="text-sm text-gray-500 mt-1">or click to browse</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function formatSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
