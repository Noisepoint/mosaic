/**
 * 图像处理工具函数
 * 实现马赛克和模糊效果算法
 */

/**
 * 应用马赛克效果
 * @param {ImageData} imageData - 图像数据
 * @param {number} x - 起始x坐标
 * @param {number} y - 起始y坐标
 * @param {number} width - 区域宽度
 * @param {number} height - 区域高度
 * @param {number} mosaicSize - 马赛克块大小
 * @returns {ImageData} 处理后的图像数据
 */
export const applyMosaic = (imageData, x, y, width, height, mosaicSize) => {
  const data = imageData.data;
  const imgWidth = imageData.width;

  // 确保坐标在有效范围内
  const startX = Math.max(0, Math.floor(x));
  const startY = Math.max(0, Math.floor(y));
  const endX = Math.min(imgWidth, Math.floor(x + width));
  const endY = Math.min(imageData.height, Math.floor(y + height));

  // 遍历每个马赛克块
  for (let py = startY; py < endY; py += mosaicSize) {
    for (let px = startX; px < endX; px += mosaicSize) {
      // 计算当前块的实际边界
      const blockWidth = Math.min(mosaicSize, endX - px);
      const blockHeight = Math.min(mosaicSize, endY - py);

      // 计算块内平均颜色
      let r = 0, g = 0, b = 0, a = 0;
      let pixelCount = 0;

      for (let by = py; by < py + blockHeight; by++) {
        for (let bx = px; bx < px + blockWidth; bx++) {
          const index = (by * imgWidth + bx) * 4;
          r += data[index];
          g += data[index + 1];
          b += data[index + 2];
          a += data[index + 3];
          pixelCount++;
        }
      }

      // 计算平均值
      r = Math.round(r / pixelCount);
      g = Math.round(g / pixelCount);
      b = Math.round(b / pixelCount);
      a = Math.round(a / pixelCount);

      // 将平均颜色应用到整个块
      for (let by = py; by < py + blockHeight; by++) {
        for (let bx = px; bx < px + blockWidth; bx++) {
          const index = (by * imgWidth + bx) * 4;
          data[index] = r;
          data[index + 1] = g;
          data[index + 2] = b;
          data[index + 3] = a;
        }
      }
    }
  }

  return imageData;
};

/**
 * 应用模糊效果
 * @param {ImageData} imageData - 图像数据
 * @param {number} x - 起始x坐标
 * @param {number} y - 起始y坐标
 * @param {number} width - 区域宽度
 * @param {number} height - 区域高度
 * @param {number} radius - 模糊半径
 * @returns {ImageData} 处理后的图像数据
 */
export const applyBlur = (imageData, x, y, width, height, radius) => {
  const data = imageData.data;
  const imgWidth = imageData.width;
  const imgHeight = imageData.height;

  // 确保坐标在有效范围内
  const startX = Math.max(0, Math.floor(x));
  const startY = Math.max(0, Math.floor(y));
  const endX = Math.min(imgWidth, Math.floor(x + width));
  const endY = Math.min(imgHeight, Math.floor(y + height));

  // 创建原始数据的副本
  const originalData = new Uint8ClampedArray(data);

  // 生成高斯核
  const kernel = generateGaussianKernel(radius);
  const kernelSize = kernel.length;
  const halfKernel = Math.floor(kernelSize / 2);

  // 对每个像素应用模糊
  for (let py = startY; py < endY; py++) {
    for (let px = startX; px < endX; px++) {
      let r = 0, g = 0, b = 0, a = 0;
      let kernelSum = 0;

      // 应用高斯核
      for (let ky = 0; ky < kernelSize; ky++) {
        for (let kx = 0; kx < kernelSize; kx++) {
          const sampleY = py + ky - halfKernel;
          const sampleX = px + kx - halfKernel;

          // 确保采样点在图像范围内
          if (sampleY >= 0 && sampleY < imgHeight && sampleX >= 0 && sampleX < imgWidth) {
            const sampleIndex = (sampleY * imgWidth + sampleX) * 4;
            const weight = kernel[ky][kx];

            r += originalData[sampleIndex] * weight;
            g += originalData[sampleIndex + 1] * weight;
            b += originalData[sampleIndex + 2] * weight;
            a += originalData[sampleIndex + 3] * weight;
            kernelSum += weight;
          }
        }
      }

      // 归一化并设置像素值
      const index = (py * imgWidth + px) * 4;
      data[index] = Math.round(r / kernelSum);
      data[index + 1] = Math.round(g / kernelSum);
      data[index + 2] = Math.round(b / kernelSum);
      data[index + 3] = Math.round(a / kernelSum);
    }
  }

  return imageData;
};

/**
 * 生成高斯核
 * @param {number} radius - 模糊半径
 * @returns {number[][]} 高斯核矩阵
 */
function generateGaussianKernel(radius) {
  const size = radius * 2 + 1;
  const kernel = [];
  const sigma = radius / 3; // 标准差
  const twoSigmaSquare = 2 * sigma * sigma;
  let sum = 0;

  // 生成高斯核
  for (let y = 0; y < size; y++) {
    kernel[y] = [];
    for (let x = 0; x < size; x++) {
      const dx = x - radius;
      const dy = y - radius;
      const weight = Math.exp(-(dx * dx + dy * dy) / twoSigmaSquare);
      kernel[y][x] = weight;
      sum += weight;
    }
  }

  // 归一化
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      kernel[y][x] /= sum;
    }
  }

  return kernel;
}

/**
 * 应用效果到选区列表
 * @param {ImageData} imageData - 图像数据
 * @param {Array} selections - 选区列表
 * @param {string} effectType - 效果类型 ('mosaic' 或 'blur')
 * @param {number} effectParam - 效果参数（马赛克大小或模糊半径）
 * @returns {ImageData} 处理后的图像数据
 */
export const applyEffectsToSelections = (imageData, selections, effectType, effectParam) => {
  // 创建图像数据副本
  const processedData = new ImageData(
    new Uint8ClampedArray(imageData.data),
    imageData.width,
    imageData.height
  );

  // 对每个选区应用效果
  selections.forEach(selection => {
    if (selection.type === 'rectangle') {
      if (effectType === 'mosaic') {
        applyMosaic(processedData, selection.x, selection.y, selection.width, selection.height, effectParam);
      } else if (effectType === 'blur') {
        applyBlur(processedData, selection.x, selection.y, selection.width, selection.height, effectParam);
      }
    }
  });

  return processedData;
};

/**
 * 导出图片
 * @param {HTMLCanvasElement} canvas - 画布元素
 * @param {Object} options - 导出选项
 * @param {string} options.format - 导出格式 ('png' 或 'jpg')
 * @param {number} options.quality - 导出质量 (0-1, 仅对JPG有效)
 * @param {boolean} options.originalSize - 是否导出原始大小
 * @returns {string} 图片的data URL
 */
export const exportImage = (canvas, options = {}) => {
  const {
    format = 'png',
    quality = 0.9,
    originalSize = false
  } = options;

  let exportCanvas = canvas;
  let exportWidth = canvas.width;
  let exportHeight = canvas.height;

  // 如果需要原始大小，重新绘制到新画布
  if (originalSize && canvas.originalWidth && canvas.originalHeight) {
    exportCanvas = document.createElement('canvas');
    exportCanvas.width = canvas.originalWidth;
    exportCanvas.height = canvas.originalHeight;

    const ctx = exportCanvas.getContext('2d');
    ctx.drawImage(canvas, 0, 0, canvas.originalWidth, canvas.originalHeight);

    exportWidth = canvas.originalWidth;
    exportHeight = canvas.originalHeight;
  }

  // 格式化MIME类型
  const mimeType = format === 'jpg' ? 'image/jpeg' : 'image/png';

  return exportCanvas.toDataURL(mimeType, quality);
};

/**
 * 下载图片
 * @param {string} dataUrl - 图片的data URL
 * @param {string} filename - 文件名
 */
export const downloadImage = (dataUrl, filename) => {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};