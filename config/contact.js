// 联系我模块配置文件
export const contactConfig = {
  // 管理员访问token（可自定义）
  adminToken: 'admin123',

  // 默认二维码图片路径
  defaultQrCode: '/qr-default.png',

  // 二维码图片URL（可通过管理后台替换）
  qrCodeUrl: '',

  // 联系我文案
  contactText: '扫码关注',

  // 是否显示更新时间
  showUpdateTime: false,

  // 更新时间（可选）
  lastUpdateTime: null,

  // GitHub图床配置（推荐免费图床）
  github: {
    // 可以配置GitHub仓库作为图床
    repo: '',
    branch: 'main',
    path: 'images/qr-code.png'
  }
}

// 获取当前二维码图片URL
export const getQrCodeUrl = () => {
  const stored = localStorage.getItem('qrCodeUrl');
  return stored || contactConfig.defaultQrCode;
}

// 设置二维码图片URL
export const setQrCodeUrl = (url) => {
  localStorage.setItem('qrCodeUrl', url);
  contactConfig.qrCodeUrl = url;
  contactConfig.lastUpdateTime = new Date().toISOString();
}

// 检查是否为管理员模式
export const isAdminMode = () => {
  const params = new URLSearchParams(window.location.search);
  return params.get('admin') === contactConfig.adminToken;
}