import React, { useState, useEffect } from 'react';
import ImageUploader from './components/ImageUploader';
import ImagePreview from './components/ImagePreview';
import MosaicCanvas from './components/MosaicCanvas';
import Toolbar from './components/Toolbar';
import ContactBlock from './components/ContactBlock';
import { useSelectionUndo, useUndoShortcuts } from './hooks/useUndo';
import { exportAndDownloadImage } from './utils/exportUtils';
import './index.css';
import { I18nProvider, useI18n } from './i18n.jsx';

function AppInner() {
  const { t, lang, setLang } = useI18n();
  const [imageData, setImageData] = useState(null);
  const [currentEffect, setCurrentEffect] = useState('mosaic');
  const [mosaicSize, setMosaicSize] = useState(10);
  const [blurRadius, setBlurRadius] = useState(5);

  // 撤销重做状态管理 - 使用单一状态源
  const [appState, setAppState] = useState({
    selections: [],
    history: [[]],
    historyIndex: 0
  });

  const { selections, history, historyIndex } = appState;

  // 计算按钮状态 - 每次render都重新计算
  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  
  // 添加到历史记录
  const addToHistory = (newSelections) => {
    setAppState(prev => {
      const newHistory = prev.history.slice(0, prev.historyIndex + 1);
      newHistory.push([...newSelections]);
      return {
        selections: newSelections,
        history: newHistory,
        historyIndex: newHistory.length - 1
      };
    });
  };

  // 撤销
  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      const previousSelections = history[newIndex];
      setAppState(prev => ({
        ...prev,
        selections: previousSelections,
        historyIndex: newIndex
      }));
    }
  };

  // 重做
  const redo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      const nextSelections = history[newIndex];
      setAppState(prev => ({
        ...prev,
        selections: nextSelections,
        historyIndex: newIndex
      }));
    }
  };

  // 重置
  const resetSelections = () => {
    setAppState({
      selections: [],
      history: [[]],
      historyIndex: 0
    });
  };

  // 启用撤销快捷键
  useUndoShortcuts(undo, redo, imageData !== null);

  // 处理图片上传
  const handleImageUpload = (data) => {
    setImageData(data);
    resetSelections(); // 重置选区
  };

  // 移除图片
  const handleRemoveImage = () => {
    console.log('handleRemoveImage called'); // 调试信息
    setImageData(null);
    resetSelections();
    console.log('Image removed and selections reset'); // 调试信息
  };

  // 处理选区变化
  const handleSelectionChange = (newSelections) => {
    // 只有当选区真的发生变化时才添加到历史
    if (JSON.stringify(newSelections) !== JSON.stringify(selections)) {
      addToHistory(newSelections);
    }
  };

  // 撤销操作
  const handleUndo = () => {
    undo();
  };

  // 重做操作
  const handleRedo = () => {
    redo();
  };

  // 导出图片
  const handleExport = async (options) => {
    if (!imageData || selections.length === 0) {
      alert('请先选择需要打码的区域');
      return;
    }

    try {
      const result = await exportAndDownloadImage(
        imageData,
        selections,
        {
          currentEffect,
          mosaicSize,
          blurRadius
        },
        options
      );

      if (result.success) {
        console.log('图片导出成功:', result.filename);
      } else {
        alert(`导出失败: ${result.error}`);
      }
    } catch (error) {
      console.error('导出出错:', error);
      alert('导出失败，请重试');
    }
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
              <h1 className="text-xl font-bold text-gray-900">{t('appTitle')}</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">{t('onlineSubtitle')}</div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">{t('language')}</span>
                <select
                  value={lang}
                  onChange={(e) => setLang(e.target.value)}
                  className="text-sm border border-gray-300 rounded px-2 py-1"
                >
                  <option value="zh">{t('zhCN')}</option>
                  <option value="en">{t('enUS')}</option>
                </select>
              </div>
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
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('startProcessing')}</h2>
                <p className="text-gray-600 max-w-md">
                  {t('uploadHint')}
                </p>
              </div>

              <ImageUploader onImageUpload={handleImageUpload} />

              {/* 联系我组件 */}
              <div className="mt-12">
                <ContactBlock />
              </div>
            </div>
          ) : (
            // 图片编辑区域
            <div className="space-y-6">
              {/* 顶部信息栏 */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <h2 className="text-lg font-semibold text-gray-900">{t('editing')}</h2>
                    {imageData && (
                      <div className="text-sm text-gray-600">
                        {imageData.name} • {imageData.width} × {imageData.height} px
                      </div>
                    )}
                  </div>
                  <button onClick={handleRemoveImage} className="btn-secondary text-sm">{t('changeImage')}</button>
                </div>
              </div>

              {/* 主要编辑区域 */}
              <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                {/* 左侧：画布编辑区 */}
                <div className="xl:col-span-3">
                  <MosaicCanvas
                    imageData={imageData}
                    onSelectionChange={handleSelectionChange}
                    currentEffect={currentEffect}
                    mosaicSize={mosaicSize}
                    blurRadius={blurRadius}
                    selections={selections}
                  />
                </div>

                {/* 右侧：工具栏 */}
                <div className="xl:col-span-1 space-y-6">
                  <Toolbar
                    currentEffect={currentEffect}
                    onEffectChange={setCurrentEffect}
                    mosaicSize={mosaicSize}
                    onMosaicSizeChange={setMosaicSize}
                    blurRadius={blurRadius}
                    onBlurRadiusChange={setBlurRadius}
                    onUndo={handleUndo}
                    onRedo={handleRedo}
                    canUndo={canUndo}
                    canRedo={canRedo}
                    onExport={handleExport}
                    hasSelections={selections.length > 0}
                  />

                  {/* 联系我组件 */}
                  <ContactBlock />
                </div>
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

function App() {
  return (
    <I18nProvider>
      <AppInner />
    </I18nProvider>
  );
}

export default App;
