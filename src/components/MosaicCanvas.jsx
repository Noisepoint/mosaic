import React, { useRef, useEffect, useState, useCallback } from 'react';

const MosaicCanvas = ({ imageData, onSelectionChange }) => {
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

  // 绘制选区覆盖层
  const drawOverlay = useCallback(() => {
    const overlayCanvas = overlayCanvasRef.current;
    if (!overlayCanvas) return;

    const ctx = overlayCanvas.getContext('2d');
    ctx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);

    // 绘制所有选区
    selections.forEach(selection => {
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);

      if (selection.type === 'rectangle') {
        const displayCoords = mapToDisplayCoords(selection.x, selection.y);
        const displaySize = mapToDisplayCoords(selection.width, selection.height);

        ctx.strokeRect(displayCoords.x, displayCoords.y, displaySize.x, displaySize.y);

        // 填充半透明蓝色
        ctx.fillStyle = 'rgba(59, 130, 246, 0.2)';
        ctx.fillRect(displayCoords.x, displayCoords.y, displaySize.x, displaySize.y);
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

  // 绘制图片
  const drawImage = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imageData) return;

    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // 清空画布
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 绘制图片
      ctx.drawImage(img, 0, 0, canvasSize.width, canvasSize.height);

      // 绘制覆盖层
      drawOverlay();
    };

    img.src = imageData.url;
  }, [imageData, canvasSize, drawOverlay]);

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

  // 当选区变化时通知父组件
  useEffect(() => {
    onSelectionChange(selections);
  }, [selections, onSelectionChange]);

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
    setStartPoint(originalCoords);

    if (currentTool === 'rectangle') {
      setCurrentRect({
        x: originalCoords.x,
        y: originalCoords.y,
        width: 0,
        height: 0,
        type: 'rectangle'
      });
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
    }
  };

  const handleMouseUp = () => {
    if (isDrawing && currentRect && currentRect.width > 5 && currentRect.height > 5) {
      // 只有矩形选区有实际大小时才添加
      setSelections(prev => [...prev, currentRect]);
    }

    setIsDrawing(false);
    setCurrentRect(null);
    setStartPoint(null);
  };

  // 删除选区
  const deleteSelection = (index) => {
    setSelections(prev => prev.filter((_, i) => i !== index));
  };

  // 清空所有选区
  const clearSelections = () => {
    setSelections([]);
  };

  return (
    <div className="space-y-4">
      {/* 工具栏 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">工具：</span>

            <button
              onClick={() => setCurrentTool('rectangle')}
              className={`btn-icon ${currentTool === 'rectangle' ? 'tool-active' : ''}`}
              title="矩形选区"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <rect x="4" y="6" width="16" height="12" strokeWidth={2} />
              </svg>
            </button>

            <button
              onClick={() => setCurrentTool('brush')}
              className={`btn-icon ${currentTool === 'brush' ? 'tool-active' : ''}`}
              title="画笔涂抹"
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

            <button
              onClick={() => setCurrentTool('eraser')}
              className={`btn-icon ${currentTool === 'eraser' ? 'tool-active' : ''}`}
              title="橡皮擦"
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
          </div>

          {/* 画笔大小控制 */}
          {currentTool === 'brush' || currentTool === 'eraser' ? (
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-700">大小：</span>
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
        <p className="text-sm text-blue-700">
          💡 提示：选择工具后在图片上拖拽来选择需要打码的区域
        </p>
      </div>
    </div>
  );
};

export default MosaicCanvas;