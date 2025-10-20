import React, { useState } from 'react';
import { useI18n } from '../i18n.jsx';

const Toolbar = ({
  currentEffect,
  onEffectChange,
  mosaicSize,
  onMosaicSizeChange,
  blurRadius,
  onBlurRadiusChange,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onExport,
  hasSelections
}) => {
  const { t } = useI18n();
  const [exportFormat, setExportFormat] = useState('png');
  const [exportQuality, setExportQuality] = useState(0.9);

  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="space-y-4">
        {/* 效果选择 */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">{t('effect')}</h3>
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                value="mosaic"
                checked={currentEffect === 'mosaic'}
                onChange={(e) => onEffectChange(e.target.value)}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{t('mosaic')}</span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                value="blur"
                checked={currentEffect === 'blur'}
                onChange={(e) => onEffectChange(e.target.value)}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{t('blur')}</span>
            </label>
          </div>
        </div>

        {/* 效果参数 */}
        <div>
          {currentEffect === 'mosaic' ? (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                {t('mosaicSize')}: {mosaicSize}px
              </label>
              <input
                type="range"
                min="2"
                max="20"
                value={mosaicSize}
                onChange={(e) => onMosaicSizeChange(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>细</span>
                <span>粗</span>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                {t('blurStrength')}: {blurRadius}px
              </label>
              <input
                type="range"
                min="1"
                max="15"
                value={blurRadius}
                onChange={(e) => onBlurRadiusChange(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>轻</span>
                <span>重</span>
              </div>
            </div>
          )}
        </div>

        {/* 操作按钮 */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                console.log('撤销按钮点击 - canUndo:', canUndo);
                console.log('onUndo函数:', typeof onUndo);
                onUndo?.();
              }}
              disabled={!canUndo}
              className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
              title="撤销 (Ctrl+Z)"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                />
              </svg>
              <span>{t('undo')}</span>
            </button>

            <button
              onClick={onRedo}
              disabled={!canRedo}
              className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
              title="恢复 (Ctrl+Y)"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6"
                />
              </svg>
              <span>{t('redo')}</span>
            </button>
          </div>

          {/* 导出设置 */}
          <div className="border-t pt-3">
            <h3 className="text-sm font-medium text-gray-700 mb-3">{t('exportSettings')}</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-4">
                <label className="text-sm text-gray-700">{t('format')}：</label>
                <select
                  value={exportFormat}
                  onChange={(e) => setExportFormat(e.target.value)}
                  className="text-sm border border-gray-300 rounded px-2 py-1"
                >
                  <option value="png">PNG</option>
                  <option value="jpg">JPG</option>
                </select>

                {exportFormat === 'jpg' && (
                  <div className="flex items-center space-x-2">
                    <label className="text-sm text-gray-700">{t('quality')}：</label>
                    <select
                      value={exportQuality}
                      onChange={(e) => setExportQuality(Number(e.target.value))}
                      className="text-sm border border-gray-300 rounded px-2 py-1"
                    >
                      <option value="0.7">70%</option>
                      <option value="0.8">80%</option>
                      <option value="0.9">90%</option>
                      <option value="1.0">100%</option>
                    </select>
                  </div>
                )}
              </div>

              <button
                onClick={() => onExport({ format: exportFormat, quality: exportQuality })}
                disabled={!hasSelections}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {hasSelections ? t('exportImage') : t('pleaseSelect')}
              </button>
            </div>
          </div>
        </div>

        {/* 快捷键提示 */}
        <div className="text-xs text-gray-500 space-y-1 pt-2 border-t">
          <p>• 按住 Shift 键可以绘制正方形</p>
          <p>• Ctrl+Z 撤销，Ctrl+Y 恢复</p>
          <p>• 双击选区可以删除</p>
        </div>
      </div>
    </div>
  );
};

export default Toolbar;