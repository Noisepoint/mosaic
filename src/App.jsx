import React, { useState } from 'react';
import ImageUploader from './components/ImageUploader';
import ImagePreview from './components/ImagePreview';
import MosaicCanvas from './components/MosaicCanvas';
import Toolbar from './components/Toolbar';
import './index.css';

function App() {
  const [imageData, setImageData] = useState(null);
  const [currentEffect, setCurrentEffect] = useState('mosaic');
  const [mosaicSize, setMosaicSize] = useState(10);
  const [blurRadius, setBlurRadius] = useState(5);
  const [selections, setSelections] = useState([]);

  // 处理图片上传
  const handleImageUpload = (data) => {
    setImageData(data);
    setSelections([]); // 重置选区
  };

  // 移除图片
  const handleRemoveImage = () => {
    setImageData(null);
    setSelections([]);
  };

  // 处理选区变化
  const handleSelectionChange = (newSelections) => {
    setSelections(newSelections);
  };

  // 撤销操作
  const handleUndo = () => {
    // 将在Stage 4实现
    console.log('Undo operation');
  };

  // 重做操作
  const handleRedo = () => {
    // 将在Stage 4实现
    console.log('Redo operation');
  };

  // 导出图片
  const handleExport = (options) => {
    // 将在Stage 4实现
    console.log('Export with options:', options);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* 头部 */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
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
              </div>
              <h1 className="text-xl font-bold text-gray-900">图片打码工具</h1>
            </div>

            <div className="text-sm text-gray-500">
              在线马赛克处理工具
            </div>
          </div>
        </div>
      </header>

      {/* 主要内容区域 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {!imageData ? (
            // 上传区域
            <div className="flex flex-col items-center justify-center py-12">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  开始处理您的图片
                </h2>
                <p className="text-gray-600 max-w-md">
                  上传图片后，您可以自由选择需要打码的区域，支持马赛克和模糊两种效果
                </p>
              </div>

              <ImageUploader onImageUpload={handleImageUpload} />
            </div>
          ) : (
            // 图片编辑区域
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* 左侧：图片和画布 */}
              <div className="lg:col-span-3 space-y-4">
                <ImagePreview
                  imageData={imageData}
                  onRemove={handleRemoveImage}
                />

                <MosaicCanvas
                  imageData={imageData}
                  onSelectionChange={handleSelectionChange}
                  currentEffect={currentEffect}
                  mosaicSize={mosaicSize}
                  blurRadius={blurRadius}
                />
              </div>

              {/* 右侧：工具栏 */}
              <div className="lg:col-span-1">
                <Toolbar
                  currentEffect={currentEffect}
                  onEffectChange={setCurrentEffect}
                  mosaicSize={mosaicSize}
                  onMosaicSizeChange={setMosaicSize}
                  blurRadius={blurRadius}
                  onBlurRadiusChange={setBlurRadius}
                  onUndo={handleUndo}
                  onRedo={handleRedo}
                  canUndo={false} // 将在Stage 4实现
                  canRedo={false} // 将在Stage 4实现
                  onExport={handleExport}
                  hasSelections={selections.length > 0}
                />
              </div>
            </div>
          )}
        </div>
      </main>

      {/* 底部联系信息 */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-500">
            <p>© 2024 图片打码工具. 所有图片处理均在本地完成，保护您的隐私。</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
