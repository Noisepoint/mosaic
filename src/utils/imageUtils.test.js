/**
 * 图像处理算法测试
 */

import { applyMosaic, applyBlur, applyEffectsToSelections } from './imageUtils.js';

// 创建测试用的ImageData
function createTestImageData(width, height) {
  const data = new Uint8ClampedArray(width * height * 4);

  // 创建彩色渐变图案用于测试
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const index = (y * width + x) * 4;
      data[index] = (x / width) * 255;     // R: 红色渐变
      data[index + 1] = (y / height) * 255; // G: 绿色渐变
      data[index + 2] = 128;                 // B: 固定蓝色
      data[index + 3] = 255;                 // A: 不透明
    }
  }

  return new ImageData(data, width, height);
}

// 测试马赛克算法
export function testMosaicAlgorithm() {
  console.log('🧪 测试马赛克算法...');

  const width = 100;
  const height = 100;
  const imageData = createTestImageData(width, height);
  const originalData = new Uint8ClampedArray(imageData.data);

  // 应用马赛克效果
  const mosaicSize = 10;
  const processedData = applyMosaic(imageData, 20, 20, 60, 60, mosaicSize);

  // 验证结果
  let passed = true;

  // 检查马赛克区域外的像素是否保持不变
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (x < 20 || x >= 80 || y < 20 || y >= 80) {
        const index = (y * width + x) * 4;
        if (processedData.data[index] !== originalData[index] ||
            processedData.data[index + 1] !== originalData[index + 1] ||
            processedData.data[index + 2] !== originalData[index + 2]) {
          passed = false;
          console.error(`❌ 马赛克区域外像素被错误修改: (${x}, ${y})`);
        }
      }
    }
  }

  // 检查马赛克区域内是否有块状效果
  let blockCount = 0;
  for (let y = 25; y < 75; y += mosaicSize) {
    for (let x = 25; x < 75; x += mosaicSize) {
      const baseIndex = (y * width + x) * 4;
      const baseColor = [
        processedData.data[baseIndex],
        processedData.data[baseIndex + 1],
        processedData.data[baseIndex + 2]
      ];

      // 检查块内像素颜色是否一致
      for (let by = y; by < Math.min(y + mosaicSize, 80); by++) {
        for (let bx = x; bx < Math.min(x + mosaicSize, 80); bx++) {
          const index = (by * width + bx) * 4;
          if (Math.abs(processedData.data[index] - baseColor[0]) > 1 ||
              Math.abs(processedData.data[index + 1] - baseColor[1]) > 1 ||
              Math.abs(processedData.data[index + 2] - baseColor[2]) > 1) {
            passed = false;
            console.error(`❌ 马赛克块内颜色不一致: (${bx}, ${by})`);
          }
        }
      }
      blockCount++;
    }
  }

  if (passed) {
    console.log(`✅ 马赛克算法测试通过，处理了 ${blockCount} 个块`);
  }

  return passed;
}

// 测试模糊算法
export function testBlurAlgorithm() {
  console.log('🧪 测试模糊算法...');

  const width = 100;
  const height = 100;
  const imageData = createTestImageData(width, height);

  // 应用模糊效果
  const blurRadius = 5;
  const processedData = applyBlur(imageData, 20, 20, 60, 60, blurRadius);

  // 验证结果
  let passed = true;
  let blurDetected = false;

  // 检查模糊区域内的颜色变化
  for (let y = 30; y < 70; y++) {
    for (let x = 30; x < 70; x++) {
      const index = (y * width + x) * 4;

      // 检查颜色值是否在有效范围内
      if (processedData.data[index] < 0 || processedData.data[index] > 255 ||
          processedData.data[index + 1] < 0 || processedData.data[index + 1] > 255 ||
          processedData.data[index + 2] < 0 || processedData.data[index + 2] > 255 ||
          processedData.data[index + 3] < 0 || processedData.data[index + 3] > 255) {
        passed = false;
        console.error(`❌ 模糊后颜色值超出范围: (${x}, ${y})`);
      }

      // 检查是否有模糊效果（颜色值应该被平均化）
      if (x > 20 && x < 80 && y > 20 && y < 80) {
        const expectedR = (x / width) * 255;
        const expectedG = (y / height) * 255;

        if (Math.abs(processedData.data[index] - expectedR) > 10 ||
            Math.abs(processedData.data[index + 1] - expectedG) > 10) {
          blurDetected = true;
        }
      }
    }
  }

  if (!blurDetected) {
    passed = false;
    console.error('❌ 模糊效果未检测到');
  }

  if (passed) {
    console.log('✅ 模糊算法测试通过');
  }

  return passed;
}

// 测试多选区处理
export function testMultiSelectionProcessing() {
  console.log('🧪 测试多选区处理...');

  const width = 100;
  const height = 100;
  const imageData = createTestImageData(width, height);
  const originalData = new Uint8ClampedArray(imageData.data);

  // 创建多个选区
  const selections = [
    { type: 'rectangle', x: 10, y: 10, width: 30, height: 30 },
    { type: 'rectangle', x: 60, y: 60, width: 30, height: 30 }
  ];

  // 应用效果
  const processedData = applyEffectsToSelections(imageData, selections, 'mosaic', 5);

  // 验证结果
  let passed = true;
  let processedBlocks = 0;

  selections.forEach((selection, index) => {
    // 检查选区内是否被处理
    let foundProcessed = false;
    for (let y = selection.y; y < selection.y + selection.height && !foundProcessed; y++) {
      for (let x = selection.x; x < selection.x + selection.width && !foundProcessed; x++) {
        const index = (y * width + x) * 4;
        if (processedData.data[index] !== originalData[index]) {
          foundProcessed = true;
          processedBlocks++;
        }
      }
    }

    if (!foundProcessed) {
      passed = false;
      console.error(`❌ 选区 ${index} 未被处理`);
    }
  });

  if (passed) {
    console.log(`✅ 多选区处理测试通过，处理了 ${processedBlocks} 个选区`);
  }

  return passed;
}

// 运行所有测试
export function runAllTests() {
  console.log('🚀 开始运行图像处理算法测试...');

  const results = [
    testMosaicAlgorithm(),
    testBlurAlgorithm(),
    testMultiSelectionProcessing()
  ];

  const passedCount = results.filter(result => result).length;
  const totalCount = results.length;

  console.log(`\n📊 测试结果: ${passedCount}/${totalCount} 通过`);

  if (passedCount === totalCount) {
    console.log('🎉 所有测试通过！图像处理算法工作正常。');
  } else {
    console.log('❌ 部分测试失败，请检查算法实现。');
  }

  return passedCount === totalCount;
}

// 如果直接运行此文件，执行测试
if (typeof window !== 'undefined') {
  // 浏览器环境下，添加到全局对象
  window.imageUtilsTests = {
    runAllTests,
    testMosaicAlgorithm,
    testBlurAlgorithm,
    testMultiSelectionProcessing
  };
}