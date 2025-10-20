import React from 'react';

const ImagePreview = ({ imageData, onRemove }) => {
  if (!imageData) return null;

  const { url, width, height, name, size } = imageData;

  // 格式化文件大小
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* 图片信息头部 */}
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <div>
                <p className="text-sm font-medium text-gray-900 truncate max-w-xs">
                  {name}
                </p>
                <p className="text-xs text-gray-500">
                  {width} × {height} px • {formatFileSize(size)}
                </p>
              </div>
            </div>

            <button
              onClick={onRemove}
              className="btn-icon text-red-500 hover:text-red-700 hover:bg-red-50"
              title="移除图片"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* 图片预览区域 */}
        <div className="p-4">
          <div className="relative bg-gray-100 rounded-lg overflow-hidden" style={{ paddingBottom: '56.25%' }}>
            <img
              src={url}
              alt={name}
              className="absolute inset-0 w-full h-full object-contain"
            />
          </div>
        </div>

        {/* 操作提示 */}
        <div className="bg-blue-50 px-4 py-3 border-t border-blue-100">
          <div className="flex items-center space-x-2">
            <svg
              className="w-4 h-4 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-sm text-blue-700">
              图片已加载，现在可以开始选择区域进行打码处理
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImagePreview;