import React, { useRef, useEffect, useState, useCallback } from 'react';
import { applyEffectsToSelections } from '../utils/imageUtils';
import { useI18n } from '../i18n.jsx';

const MosaicCanvas = ({
  imageData,
  onSelectionChange,
  currentEffect = 'mosaic',
  mosaicSize = 10,
  blurRadius = 5,
  selections: externalSelections = []
}) => {
  const { t } = useI18n();
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const overlayCanvasRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentTool, setCurrentTool] = useState('rectangle'); // rectangle, brush, eraser
  const [brushSize, setBrushSize] = useState(20);
  const [selections, setSelections] = useState([]);
  const [currentRect, setCurrentRect] = useState(null);
  const [startPoint, setStartPoint] = useState(null);
  const [showPreview, setShowPreview] = useState(true);
  const [lastBrushPoint, setLastBrushPoint] = useState(null); // 用于连续涂抹

  // 坐标映射函数：从显示坐标映射到原图坐标
  const mapToOriginalCoords = useCallback((displayX, displayY) => {
    if (!imageData) return { x: 0, y: 0 };
    return {
      x: Math.round(displayX / scale),
      y: Math.round(displayY / scale)
    };
  }, [imageData, scale]);

  // 坐标映射函数：从原图坐标映射到显示坐标
  const mapToDisplayCoords = useCallback((originalX, originalY) => {
    if (!imageData) return { x: 0, y: 0 };
    return {
      x: originalX * scale,
      y: originalY * scale
    };
  }, [imageData, scale]);

  // 计算缩放比例和画布大小
  useEffect(() => {
    if (!imageData || !containerRef.current) return;

    const container = containerRef.current;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    // 计算适合容器的缩放比例
    const scaleX = containerWidth / imageData.width;
    const scaleY = containerHeight / imageData.height;
    const newScale = Math.min(scaleX, scaleY, 1); // 不超过原始大小

    setScale(newScale);
    setCanvasSize({
      width: imageData.width * newScale,
      height: imageData.height * newScale
    });
  }, [imageData]);

  // 与父组件同步选区（用于撤销/重做驱动的外部变更）
  useEffect(() => {
    // 仅当外部传入与本地不同步时才更新，避免不必要重绘
    const isDifferent = JSON.stringify(externalSelections) !== JSON.stringify(selections);
    if (!isDrawing && isDifferent) {
      setSelections(externalSelections || []);
      // 不在这里调用 onSelectionChange，避免形成历史记录回环
    }
  }, [externalSelections, isDrawing]);

  // 绘制选区覆盖层
  const drawOverlay = useCallback(() => {
    const overlayCanvas = overlayCanvasRef.current;
    if (!overlayCanvas) return;

    const ctx = overlayCanvas.getContext('2d');
    ctx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);

    // 绘制所有选区
    selections.forEach(selection => {
      // 统一使用中性灰边框，避免蓝色干扰
      ctx.strokeStyle = '#9ca3af';
      ctx.lineWidth = 2;
      ctx.setLineDash(selection.type === 'rectangle' ? [5, 5] : []);

      if (selection.type === 'rectangle') {
        const displayCoords = mapToDisplayCoords(selection.x, selection.y);
        const displaySize = mapToDisplayCoords(selection.width, selection.height);

        ctx.strokeRect(displayCoords.x, displayCoords.y, displaySize.x, displaySize.y);

        // 使用中性灰色半透明，避免给用户造成颜色偏蓝的错觉
        ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
        ctx.fillRect(displayCoords.x, displayCoords.y, displaySize.x, displaySize.y);
      } else if (selection.type === 'brush') {
        // 画笔：绘制平滑的实心圆形覆盖，不使用虚线边
        const displayCenter = mapToDisplayCoords(selection.cx, selection.cy);
        const displayR = selection.r * scale; // r 是原图半径
        ctx.beginPath();
        ctx.arc(displayCenter.x, displayCenter.y, displayR, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
        ctx.fill();
      }
    });

    // 绘制当前正在绘制的矩形
    if (currentRect) {
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);

      const displayCoords = mapToDisplayCoords(currentRect.x, currentRect.y);
      const displaySize = mapToDisplayCoords(currentRect.width, currentRect.height);

      ctx.strokeRect(displayCoords.x, displayCoords.y, displaySize.x, displaySize.y);

      ctx.fillStyle = 'rgba(239, 68, 68, 0.2)';
      ctx.fillRect(displayCoords.x, displayCoords.y, displaySize.x, displaySize.y);
    }

    ctx.setLineDash([]);
  }, [selections, currentRect, mapToDisplayCoords]);

  // 绘制图片和效果
  const drawImage = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imageData) return;

    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // 清空画布
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 绘制原始图片
      ctx.drawImage(img, 0, 0, canvasSize.width, canvasSize.height);

      // 如果有选区且启用预览，应用效果
      if (showPreview && selections.length > 0) {
        try {
          // 获取原始图像数据
          const originalImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

          // 计算效果参数（根据缩放调整）
          const effectParam = currentEffect === 'mosaic'
            ? Math.max(2, Math.floor(mosaicSize / scale))
            : Math.max(1, Math.floor(blurRadius / scale));

          // 创建调整后的选区（根据缩放调整坐标）
          const adjustedSelections = selections.map(selection => {
            if (selection.type === 'brush') {
              // 将圆形刷点转换为与效果处理兼容的矩形包围盒
              return {
                x: (selection.cx - selection.r) * scale,
                y: (selection.cy - selection.r) * scale,
                width: (selection.r * 2) * scale,
                height: (selection.r * 2) * scale,
                type: 'rectangle'
              };
            }
            return {
              ...selection,
              x: selection.x * scale,
              y: selection.y * scale,
              width: selection.width * scale,
              height: selection.height * scale
            };
          });

          // 应用效果
          const processedImageData = applyEffectsToSelections(
            originalImageData,
            adjustedSelections,
            currentEffect,
            effectParam
          );

          // 绘制处理后的图像
          ctx.putImageData(processedImageData, 0, 0);
        } catch (error) {
          console.error('应用效果时出错:', error);
        }
      }

      // 绘制覆盖层（选区边框）
      drawOverlay();
    };

    img.src = imageData.url;
  }, [imageData, canvasSize, selections, currentEffect, mosaicSize, blurRadius, scale, showPreview, drawOverlay]);

  // 初始化画布
  useEffect(() => {
    const canvas = canvasRef.current;
    const overlayCanvas = overlayCanvasRef.current;
    if (!canvas || !overlayCanvas) return;

    canvas.width = canvasSize.width;
    canvas.height = canvasSize.height;

    overlayCanvas.width = canvasSize.width;
    overlayCanvas.height = canvasSize.height;

    drawImage();
  }, [canvasSize, drawImage]);

  // 注意：不再在这里自动上报 onSelectionChange，以避免外部同步->内部更新->再次上报导致的历史栈循环。

  // 重新绘制覆盖层
  useEffect(() => {
    drawOverlay();
  }, [drawOverlay]);

  // 鼠标事件处理
  const handleMouseDown = (e) => {
    const rect = overlayCanvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const originalCoords = mapToOriginalCoords(x, y);

    setIsDrawing(true);
    setShowPreview(false); // 绘制中关闭重计算，避免卡顿
    setStartPoint(originalCoords);

    if (currentTool === 'rectangle') {
      setCurrentRect({
        x: originalCoords.x,
        y: originalCoords.y,
        width: 0,
        height: 0,
        type: 'rectangle'
      });
    } else if (currentTool === 'brush') {
      // 涂抹笔功能 - 使用圆形刷点，记录中心和半径，渲染更顺滑
      const brushSelection = {
        cx: originalCoords.x,
        cy: originalCoords.y,
        r: Math.max(1, Math.floor(brushSize / 2)),
        type: 'brush'
      };
      setSelections(prev => [...prev, brushSelection]);
      setLastBrushPoint(originalCoords); // 设置初始点
    }
  };

  const handleMouseMove = (e) => {
    if (!isDrawing || !startPoint) return;

    const rect = overlayCanvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const currentPoint = mapToOriginalCoords(x, y);

    if (currentTool === 'rectangle') {
      const width = currentPoint.x - startPoint.x;
      const height = e.shiftKey ? width : currentPoint.y - startPoint.y; // 按住Shift绘制正方形

      setCurrentRect({
        x: width < 0 ? currentPoint.x : startPoint.x,
        y: height < 0 ? currentPoint.y : startPoint.y,
        width: Math.abs(width),
        height: Math.abs(height),
        type: 'rectangle'
      });
    } else if (currentTool === 'brush') {
      // 涂抹笔连续绘制 - 插值填充空隙（圆形刷点）
      if (lastBrushPoint) {
        const distance = Math.sqrt(
          Math.pow(currentPoint.x - lastBrushPoint.x, 2) +
          Math.pow(currentPoint.y - lastBrushPoint.y, 2)
        );

        // 更密集的插值，步距小于等于笔刷半径的 1/3，避免断续
        const stepSpacing = Math.max(1, Math.floor(brushSize / 4)); // <= r/2
        const steps = Math.max(1, Math.ceil(distance / stepSpacing));

        setSelections(prev => {
          const next = [...prev];
          for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const interpolatedPoint = {
              x: lastBrushPoint.x + (currentPoint.x - lastBrushPoint.x) * t,
              y: lastBrushPoint.y + (currentPoint.y - lastBrushPoint.y) * t
            };
            next.push({
              cx: interpolatedPoint.x,
              cy: interpolatedPoint.y,
              r: Math.max(1, Math.floor(brushSize / 2)),
              type: 'brush'
            });
          }
          return next;
        });
      }

      setLastBrushPoint(currentPoint);
    }
  };

  const handleMouseUp = () => {
    if (isDrawing && currentRect && currentRect.width > 5 && currentRect.height > 5) {
      // 只有矩形选区有实际大小时才添加
      const newSelections = [...selections, currentRect];
      setSelections(newSelections);
      onSelectionChange(newSelections);
    }
    // 画笔：在结束时统一提交一次，避免频繁重绘和历史爆炸
    if (isDrawing && currentTool === 'brush') {
      onSelectionChange(selections);
    }

    setIsDrawing(false);
    setCurrentRect(null);
    setStartPoint(null);
    setLastBrushPoint(null); // 重置涂抹笔状态
    setShowPreview(true); // 恢复预览
  };

  // 双击删除选区
  const handleDoubleClick = (e) => {
    const rect = overlayCanvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const originalCoords = mapToOriginalCoords(x, y);

    // 检查是否双击了某个选区
    for (let i = selections.length - 1; i >= 0; i--) {
      const selection = selections[i];
      if (originalCoords.x >= selection.x &&
          originalCoords.x <= selection.x + selection.width &&
          originalCoords.y >= selection.y &&
          originalCoords.y <= selection.y + selection.height) {
        deleteSelection(i);
        break;
      }
    }
  };

  // 删除选区
  const deleteSelection = (index) => {
    const newSelections = selections.filter((_, i) => i !== index);
    setSelections(newSelections);
    onSelectionChange(newSelections);
  };

  // 清空所有选区
  const clearSelections = () => {
    setSelections([]);
    onSelectionChange([]);
  };

  return (
    <div className="space-y-4">
      {/* 工具栏 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">{t('tool')}</span>

            <button
              onClick={() => setCurrentTool('rectangle')}
              className={`btn-icon ${currentTool === 'rectangle' ? 'tool-active' : ''}`}
              title={t('rectangle')}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <rect x="4" y="6" width="16" height="12" strokeWidth={2} />
              </svg>
            </button>

            <button
              onClick={() => setCurrentTool('brush')}
              className={`btn-icon ${currentTool === 'brush' ? 'tool-active' : ''}`}
              title={t('brush')}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                />
              </svg>
            </button>

  
            {selections.length > 0 && (
              <>
                <div className="w-px h-6 bg-gray-300 mx-2" />

                <button
                  onClick={clearSelections}
                  className="btn-icon text-red-500 hover:text-red-700 hover:bg-red-50"
                  title={t('clearAll')}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </>
            )}
          </div>

          {/* 画笔大小控制 */}
          {currentTool === 'brush' || currentTool === 'eraser' ? (
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-700">{t('size')}</span>
              <input
                type="range"
                min="5"
                max="50"
                value={brushSize}
                onChange={(e) => setBrushSize(Number(e.target.value))}
                className="w-24"
              />
              <span className="text-sm text-gray-600 w-8">{brushSize}</span>
            </div>
          ) : null}
        </div>
      </div>

      {/* 画布容器 */}
      <div
        ref={containerRef}
        className="relative bg-gray-100 rounded-lg overflow-hidden"
        style={{ height: '500px' }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <canvas
            ref={canvasRef}
            className="border border-gray-300 shadow-lg"
            style={{ position: 'absolute' }}
          />
          <canvas
            ref={overlayCanvasRef}
            className="border border-gray-300 cursor-crosshair shadow-lg"
            style={{ position: 'absolute' }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onDoubleClick={handleDoubleClick}
          />
        </div>

        {/* 坐标和缩放信息 */}
        <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
          {imageData && (
            <>
              {imageData.width} × {imageData.height} px
              {scale < 1 && ` (${Math.round(scale * 100)}%)`}
            </>
          )}
        </div>
      </div>

      {/* 操作提示 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-sm text-blue-700">💡 {t('tips')}</p>
      </div>
    </div>
  );
};

export default MosaicCanvas;