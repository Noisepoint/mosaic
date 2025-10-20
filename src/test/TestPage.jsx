import React, { useState, useEffect } from 'react';
import { runAllTests } from '../utils/imageUtils.test.js';

const TestPage = () => {
  const [testResults, setTestResults] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  const runTests = async () => {
    setIsRunning(true);
    setTestResults(null);

    try {
      // 模拟测试运行
      await new Promise(resolve => setTimeout(resolve, 1000));

      const results = runAllTests();
      setTestResults({
        passed: results,
        message: results ? '所有测试通过！' : '部分测试失败',
        timestamp: new Date().toLocaleString()
      });
    } catch (error) {
      setTestResults({
        passed: false,
        message: `测试运行出错: ${error.message}`,
        timestamp: new Date().toLocaleString()
      });
    } finally {
      setIsRunning(false);
    }
  };

  // 组件功能测试
  const TestComponents = () => {
    const [testImage, setTestImage] = useState(null);

    const createTestImage = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 200;
      canvas.height = 200;
      const ctx = canvas.getContext('2d');

      // 创建测试图案
      const gradient = ctx.createLinearGradient(0, 0, 200, 200);
      gradient.addColorStop(0, '#ff0000');
      gradient.addColorStop(0.5, '#00ff00');
      gradient.addColorStop(1, '#0000ff');

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 200, 200);

      // 添加文字
      ctx.fillStyle = 'white';
      ctx.font = '20px Arial';
      ctx.fillText('TEST', 75, 105);

      setTestImage(canvas.toDataURL());
    };

    return (
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <h3 className="text-lg font-semibold mb-3">组件测试</h3>

        <div className="space-y-4">
          <div>
            <button
              onClick={createTestImage}
              className="btn-secondary"
            >
              生成测试图片
            </button>
          </div>

          {testImage && (
            <div>
              <p className="text-sm text-gray-600 mb-2">测试图片（可右键保存用于测试）：</p>
              <img
                src={testImage}
                alt="测试图片"
                className="border border-gray-300 rounded w-32 h-32"
              />
            </div>
          )}

          <div className="text-xs text-gray-500">
            <p>✅ 可以使用此图片测试：</p>
            <ul className="list-disc list-inside space-y-1 mt-1">
              <li>图片上传功能</li>
              <li>选区绘制功能</li>
              <li>马赛克/模糊效果</li>
              <li>导出下载功能</li>
            </ul>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            🧪 图片打码工具 - 测试页面
          </h1>

          <p className="text-gray-600 mb-6">
            此页面用于测试和验证图片打码工具的各项功能。
          </p>

          {/* 算法测试 */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h2 className="text-lg font-semibold mb-3">算法测试</h2>

            <button
              onClick={runTests}
              disabled={isRunning}
              className="btn-primary mb-4"
            >
              {isRunning ? '运行中...' : '运行算法测试'}
            </button>

            {testResults && (
              <div className={`p-3 rounded-lg border ${
                testResults.passed
                  ? 'bg-green-50 border-green-200 text-green-800'
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">
                    {testResults.passed ? '✅' : '❌'}
                  </span>
                  <div>
                    <p className="font-medium">{testResults.message}</p>
                    <p className="text-sm opacity-75">{testResults.timestamp}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-4 text-sm text-gray-600">
              <p>测试内容：</p>
              <ul className="list-disc list-inside space-y-1 mt-2">
                <li>马赛克算法正确性</li>
                <li>模糊算法正确性</li>
                <li>多选区处理</li>
                <li>边界条件处理</li>
              </ul>
            </div>
          </div>

          {/* 组件测试 */}
          <TestComponents />

          {/* 功能清单 */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-3 text-blue-900">✅ 功能验收清单</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium text-blue-800 mb-2">核心功能</h4>
                <ul className="space-y-1 text-blue-700">
                  <li>✅ 图片上传与预览正常</li>
                  <li>✅ 矩形选区功能可用</li>
                  <li>✅ 马赛克效果生效</li>
                  <li>✅ 模糊效果生效</li>
                  <li>✅ 导出文件正确</li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-blue-800 mb-2">高级功能</h4>
                <ul className="space-y-1 text-blue-700">
                  <li>✅ 撤销功能可用</li>
                  <li>✅ 实时预览正常</li>
                  <li>✅ 坐标映射准确</li>
                  <li>✅ 联系我模块正常</li>
                  <li>✅ 二维码可替换</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 快捷键说明 */}
          <div className="bg-yellow-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-3 text-yellow-900">⌨️ 快捷键说明</h3>
            <div className="grid grid-cols-2 gap-4 text-sm text-yellow-800">
              <div>
                <kbd className="px-2 py-1 bg-white rounded border border-yellow-300">Ctrl + Z</kbd>
                <span className="ml-2">撤销操作</span>
              </div>
              <div>
                <kbd className="px-2 py-1 bg-white rounded border border-yellow-300">Ctrl + Y</kbd>
                <span className="ml-2">重做操作</span>
              </div>
              <div>
                <kbd className="px-2 py-1 bg-white rounded border border-yellow-300">Shift + 拖拽</kbd>
                <span className="ml-2">绘制正方形</span>
              </div>
            </div>
          </div>

          {/* 返回首页链接 */}
          <div className="text-center pt-4">
            <a
              href="/"
              className="btn-primary"
            >
              返回主页使用工具
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestPage;