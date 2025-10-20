import React, { useState, useEffect } from 'react';
import { getQrCodeUrl, setQrCodeUrl, isAdminMode } from '../config/contact';

const ContactBlock = () => {
  const [qrCodeUrl, setQrCodeUrlState] = useState(getQrCodeUrl());
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editUrl, setEditUrl] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState('');

  // 检查管理员模式
  useEffect(() => {
    setIsAdmin(isAdminMode());
  }, []);

  // 更新二维码URL
  const handleUpdateQrCode = async () => {
    if (!editUrl.trim()) {
      setUpdateMessage('请输入有效的图片URL');
      setTimeout(() => setUpdateMessage(''), 3000);
      return;
    }

    setIsUpdating(true);
    setUpdateMessage('');

    try {
      // 验证URL是否有效
      const img = new Image();
      img.crossOrigin = 'anonymous';

      const loadImage = new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = editUrl;
      });

      await loadImage;

      // 更新二维码URL
      setQrCodeUrl(editUrl);
      setQrCodeUrlState(editUrl);
      setIsEditing(false);
      setUpdateMessage('二维码更新成功！');

      // 3秒后清除成功消息
      setTimeout(() => setUpdateMessage(''), 3000);

    } catch (error) {
      console.error('二维码图片加载失败:', error);
      setUpdateMessage('图片加载失败，请检查URL是否正确');
      setTimeout(() => setUpdateMessage(''), 3000);
    } finally {
      setIsUpdating(false);
    }
  };

  // 重置为默认二维码
  const handleResetToDefault = () => {
    const defaultUrl = '/qr-default.png';
    setQrCodeUrl(defaultUrl);
    setQrCodeUrlState(defaultUrl);
    setIsEditing(false);
    setEditUrl('');
    setUpdateMessage('已重置为默认二维码');
    setTimeout(() => setUpdateMessage(''), 3000);
  };

  // 获取默认二维码URL
  const getDefaultQrCodeUrl = () => {
    return '/qr-default.png';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="text-center space-y-4">
        {/* 标题 */}
        <h3 className="text-lg font-semibold text-gray-900">扫码关注</h3>

        {/* 二维码展示 */}
        <div className="flex justify-center">
          <div className="relative">
            <img
              src={qrCodeUrl || getDefaultQrCodeUrl()}
              alt="关注公众号"
              className="w-32 h-32 object-contain border border-gray-200 rounded-lg bg-white"
              onError={(e) => {
                // 如果图片加载失败，使用默认图片
                e.target.src = getDefaultQrCodeUrl();
              }}
            />

            {/* 管理员模式标记 */}
            {isAdmin && (
              <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                管理员
              </div>
            )}
          </div>
        </div>

        {/* 管理员编辑功能 */}
        {isAdmin && !isEditing && (
          <div className="space-y-3">
            <button
              onClick={() => setIsEditing(true)}
              className="btn-secondary text-sm"
            >
              更换二维码
            </button>

            <button
              onClick={handleResetToDefault}
              className="btn-secondary text-sm ml-2"
            >
              恢复默认
            </button>
          </div>
        )}

        {/* 编辑模式 */}
        {isAdmin && isEditing && (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                二维码图片URL
              </label>
              <input
                type="url"
                value={editUrl}
                onChange={(e) => setEditUrl(e.target.value)}
                placeholder="https://example.com/qrcode.png"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex space-x-2">
              <button
                onClick={handleUpdateQrCode}
                disabled={isUpdating}
                className="btn-primary text-sm flex-1 disabled:opacity-50"
              >
                {isUpdating ? '更新中...' : '确认更新'}
              </button>

              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditUrl('');
                  setUpdateMessage('');
                }}
                className="btn-secondary text-sm"
              >
                取消
              </button>
            </div>

            {/* 使用说明 */}
            <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
              <p className="font-medium mb-1">使用说明：</p>
              <ul className="space-y-1">
                <li>• 支持JPG、PNG、WebP格式</li>
                <li>• 建议尺寸：200×200像素</li>
                <li>• 推荐使用图床服务：</li>
                <li>• GitHub、Cloudinary等</li>
              </ul>
            </div>
          </div>
        )}

        {/* 更新消息 */}
        {updateMessage && (
          <div className={`text-sm p-2 rounded-lg ${
            updateMessage.includes('成功')
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {updateMessage}
          </div>
        )}

        {/* 非管理员模式的提示 */}
        {!isAdmin && (
          <div className="text-xs text-gray-500">
            <p>获取最新工具更新和使用技巧</p>
          </div>
        )}

        {/* 管理员访问提示 */}
        <div className="text-xs text-gray-400 border-t pt-3">
          {isAdmin ? (
            <p>管理员模式已启用</p>
          ) : (
            <p>管理员可通过特定链接访问编辑功能</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactBlock;