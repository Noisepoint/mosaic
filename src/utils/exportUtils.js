/**
 * 图片导出工具函数
 */

import { applyEffectsToSelections, exportImage, downloadImage } from './imageUtils.js';

/**
 * 创建处理后的图片并导出
 * @param {Object} imageData - 原始图片数据
 * @param {Array} selections - 选区列表
 * @param {Object} effectOptions - 效果选项
 * @param {Object} exportOptions - 导出选项
 * @returns {Promise<string>} 导出图片的data URL
 */
export const createExportedImage = async (imageData, selections, effectOptions, exportOptions) => {
  const {
    currentEffect = 'mosaic',
    mosaicSize = 10,
    blurRadius = 5
  } = effectOptions;

  const {
    format = 'png',
    quality = 0.9,
    originalSize = true
  } = exportOptions;

  return new Promise((resolve, reject) => {
    // 创建临时画布
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // 设置画布大小
    if (originalSize) {
      canvas.width = imageData.width;
      canvas.height = imageData.height;
      canvas.originalWidth = imageData.width;
      canvas.originalHeight = imageData.height;
    } else {
      // 使用当前显示大小
      canvas.width = imageData.width;
      canvas.height = imageData.height;
    }

    // 加载图片
    const img = new Image();
    img.crossOrigin = 'anonymous'; // 避免跨域问题

    img.onload = () => {
      try {
        // 绘制原始图片
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // 如果有选区，应用效果
        if (selections.length > 0) {
          // 获取图像数据
          const imageDataObj = ctx.getImageData(0, 0, canvas.width, canvas.height);

          // 规范化选区：将画笔刷点转换为矩形包围盒
          const normalizedSelections = selections.map(sel => {
            if (sel.type === 'brush') {
              return {
                x: Math.max(0, sel.cx - sel.r),
                y: Math.max(0, sel.cy - sel.r),
                width: Math.min(canvas.width, sel.r * 2),
                height: Math.min(canvas.height, sel.r * 2),
                type: 'rectangle'
              };
            }
            return sel;
          });

          // 应用效果
          const effectParam = currentEffect === 'mosaic' ? mosaicSize : blurRadius;
          const processedImageData = applyEffectsToSelections(
            imageDataObj,
            normalizedSelections,
            currentEffect,
            effectParam
          );

          // 绘制处理后的图像
          ctx.putImageData(processedImageData, 0, 0);
        }

        // 导出图片
        const dataUrl = exportImage(canvas, { format, quality, originalSize });
        resolve(dataUrl);

      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => reject(new Error('图片加载失败'));
    img.src = imageData.url;
  });
};

/**
 * 导出并下载图片
 * @param {Object} imageData - 原始图片数据
 * @param {Array} selections - 选区列表
 * @param {Object} effectOptions - 效果选项
 * @param {Object} exportOptions - 导出选项
 */
export const exportAndDownloadImage = async (imageData, selections, effectOptions, exportOptions) => {
  try {
    // 生成文件名
    const originalName = imageData.name || 'image';
    const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '');
    const extension = exportOptions.format || 'png';
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
    const filename = `${nameWithoutExt}_processed_${timestamp}.${extension}`;

    // 创建导出图片
    const dataUrl = await createExportedImage(imageData, selections, effectOptions, exportOptions);

    // 下载图片
    downloadImage(dataUrl, filename);

    return { success: true, filename, dataUrl };

  } catch (error) {
    console.error('导出图片失败:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 预览导出效果（不下载）
 * @param {Object} imageData - 原始图片数据
 * @param {Array} selections - 选区列表
 * @param {Object} effectOptions - 效果选项
 * @param {Object} exportOptions - 导出选项
 * @returns {Promise<string>} 预览图片的data URL
 */
export const previewExportedImage = async (imageData, selections, effectOptions, exportOptions) => {
  try {
    const dataUrl = await createExportedImage(imageData, selections, effectOptions, exportOptions);
    return { success: true, dataUrl };
  } catch (error) {
    console.error('预览导出失败:', error);
    return { success: false, error: error.message };
  }
};