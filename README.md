# 图片打码工具

一个纯前端的在线图片打码工具，支持马赛克和模糊效果，所有处理均在浏览器本地完成，保护您的隐私。

## ✨ 功能特点

- 🎯 **矩形选区**：精确选择需要打码的区域
- 🖌️ **实时预览**：即时查看打码效果
- 🔧 **多种效果**：马赛克、模糊两种处理方式
- ↩️ **撤销重做**：支持操作历史管理
- 📥 **多格式导出**：支持PNG、JPG格式
- 🌐 **纯前端**：无需服务器，保护隐私
- 📱 **响应式设计**：适配各种屏幕尺寸

## 🚀 快速开始

### 在线使用

直接访问部署好的网站即可使用，无需注册或下载。

### 本地开发

```bash
# 克隆项目
git clone [repository-url]
cd mosaic-tool

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

## 📖 使用说明

1. **上传图片**：支持拖拽或点击上传JPG、PNG、WebP格式图片（最大10MB）

2. **选择区域**：
   - 使用矩形工具选择需要打码的区域
   - 按住Shift键可绘制正方形选区

3. **调整效果**：
   - **马赛克**：调整像素块大小（2-20px）
   - **模糊**：调整模糊强度（1-15px）

4. **导出图片**：
   - 选择导出格式（PNG/JPG）
   - 设置导出质量（JPG格式）
   - 点击导出按钮下载处理后的图片

## ⌨️ 快捷键

- `Ctrl+Z`：撤销操作
- `Ctrl+Y`：重做操作
- `Shift+拖拽`：绘制正方形选区

## 🛠️ 技术栈

- **框架**：React 19 + Vite
- **样式**：Tailwind CSS
- **图像处理**：HTML5 Canvas
- **构建工具**：Vite

## 📁 项目结构

```
src/
├── components/           # React组件
│   ├── ImageUploader.jsx    # 图片上传组件
│   ├── ImagePreview.jsx     # 图片预览组件
│   ├── MosaicCanvas.jsx     # 核心画布组件
│   ├── Toolbar.jsx          # 工具栏组件
│   └── ContactBlock.jsx     # 联系我组件
├── hooks/               # 自定义Hook
│   └── useUndo.js          # 撤销/重做Hook
├── utils/               # 工具函数
│   ├── imageUtils.js        # 图像处理算法
│   ├── exportUtils.js       # 导出工具
│   └── imageUtils.test.js   # 算法测试
├── config/              # 配置文件
│   └── contact.js           # 联系模块配置
├── App.jsx              # 根组件
├── main.jsx             # 入口文件
└── index.css            # 全局样式
```


## 🌐 部署指南

### Vercel部署

1. 推送代码到GitHub仓库
2. 在Vercel中导入项目
3. 自动构建和部署

### Netlify部署

1. 运行`npm run build`构建项目
2. 将`dist`文件夹上传到Netlify
3. 配置重定向规则

### 其他平台

项目是纯静态网站，可部署到任何支持静态文件的托管平台。

## 🧪 测试

项目包含完整的图像处理算法测试：

```javascript
// 运行测试
import { runAllTests } from './src/utils/imageUtils.test.js';
runAllTests();
```

## 🔒 隐私保护

- ✅ 所有图像处理均在浏览器本地完成
- ✅ 不会上传任何文件到服务器
- ✅ 不收集用户个人信息
- ✅ 处理完成后可安全删除本地文件

## 📝 开发日志

- **Stage 1**：项目初始化、基础页面结构、图片上传功能
- **Stage 2**：选区工具实现、Canvas画布系统
- **Stage 3**：马赛克和模糊算法实现
- **Stage 4**：撤销/重做功能、图片导出功能
- **Stage 5**：联系我模块、二维码替换功能
- **Stage 6**：测试完善、部署配置

## 🤝 贡献指南

欢迎提交Issue和Pull Request！

1. Fork项目
2. 创建功能分支
3. 提交更改
4. 发起Pull Request

## 📄 许可证

MIT License

## 📞 联系我们

如有问题或建议，请通过以下方式联系：

- 在网站底部扫码关注公众号
- 提交GitHub Issue
- 发送邮件反馈

---

⭐ 如果这个工具对您有帮助，请给我们一个Star！
