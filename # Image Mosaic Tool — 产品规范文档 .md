# Image Mosaic Tool — 产品规范文档 (Final Spec)

## 1. 项目概要
**项目名称**：Image Mosaic Tool  
**目标**：提供一个纯前端网页工具，允许用户上传图片，对图片任意区域进行自定义打码（马赛克或模糊处理），并下载处理后的图片。  
**目标用户**：内容创作者、社交媒体用户、需要隐私遮挡的个人用户。  

---

## 2. 技术栈与约束
- 前端框架：React + Vite  
- 样式系统：Tailwind CSS  
- 图像操作：HTML5 Canvas  
- 所有图像处理均在浏览器端完成，无后端逻辑  
- 模块化结构清晰，代码可测试  
- 禁止引入大型图像库（除非必要）  

---

## 3. 功能清单

### 3.1 核心功能（必须）
1. **图片上传**  
   - 支持 JPG、PNG、WebP  
   - 最大 10MB  
   - 支持拖拽与点击上传  

2. **图片预览**  
   - 上传后显示完整预览图与尺寸信息  

3. **选区工具**  
   - 矩形选区  
   - 画笔涂抹选区  
   - 橡皮擦（可删除画笔选区）  

4. **处理效果**  
   - 马赛克：可调整像素格大小  
   - 模糊：可调整模糊强度  
   - 实时预览  

5. **撤销 / 删除**  
   - 支持至少一步撤销  
   - 删除当前选区  

6. **导出 / 下载**  
   - 导出为 PNG / JPG  
   - 支持导出原始分辨率  

7. **错误处理**  
   - 文件格式 / 大小验证  
   - 上传与导出错误友好提示  

8. **联系我 / 二维码区块（ContactBlock）**  
   - 显示“联系我”或“扫码关注”信息  
   - 支持替换二维码图片（详见第 6 节）  
   - 可展示更新时间  
   - 替换方式有两种（方案 A 或 B，任选其一实现）

---

## 4. 用户故事与验收标准
- 上传后图片可预览并校验格式  
- 选区绘制准确、边界清晰  
- 打码或模糊效果实时可见  
- 撤销 / 删除功能可用  
- 导出文件可在本地正确打开  
- 联系我模块显示正常，可替换二维码  

---

## 5. 关键实现细节

### 5.1 Canvas 坐标映射  
- UI 缩放时需维护“显示坐标 ↔ 原图坐标”的映射关系。  
- 保存选区时以原图坐标记录。  
- 导出时基于原始分辨率重新绘制。  

### 5.2 马赛克与模糊算法  
- `applyMosaic(imageData, x, y, w, h, mosaicSize)`  
- `applyBlur(imageData, x, y, w, h, radius)`  
- 算法需支持透明通道  
- 写单元测试验证正确性  

### 5.3 性能优化  
- 实时预览阶段仅更新 mask 层  
- 最终确认后进行重绘  
- 使用 `requestAnimationFrame` 控制渲染频率  
- 可使用离屏 canvas 提升性能  

### 5.4 导出  
- `exportImage({ format, quality, scaleToOriginal })`  
- 支持 PNG / JPG  
- 可选择导出缩放图或原始图  

---

## 6. 联系我 / 二维码替换方案  

### 方案 A — 前端临时替换  
- 管理入口通过 `?admin=token` 启用  
- 上传二维码图或外部链接后立即生效  
- 存储在 localStorage  
- 仅在本地浏览器持久化  

### 方案 B — 外部 URL 配置  
- 填写图床 / OSS 的二维码图片 URL  
- 前端直接显示该 URL  
- 替换图片即可全站同步更新  

---

## 7. 目录结构
mosaic-tool/
├── src/
│   ├── components/           # 组件目录
│   │   ├── ImageUploader.jsx # 图片上传组件
│   │   ├── MosaicCanvas.jsx  # 打码核心画布组件
│   │   ├── Toolbar.jsx       # 工具栏组件
│   │   ├── ContactBlock.jsx  # 联系作者二维码展示组件
│   │
│   ├── utils/                # 工具函数目录
│   │   ├── imageUtils.js     # 模糊/导出逻辑函数
│   │
│   ├── hooks/                # 自定义 Hook
│   │   ├── useUndo.js        # 撤销/重做逻辑
│   │
│   ├── App.jsx               # 根组件
│   ├── main.jsx              # 入口文件（ReactDOM 渲染）
│   ├── index.css             # 全局样式（含 Tailwind）
│
├── public/
│   ├── favicon.ico           # 网站图标
│   ├── qr-default.png        # 默认二维码
│
├── config/
│   ├── contact.js            # 二维码路径与链接配置（可替换）
│
├── .gitignore
├── package.json
├── vite.config.js
├── README.md

---

## 8. 开发任务阶段（每阶段完成后必须进行 Git 存档）

1. **Stage 1 — 项目初始化与基础页面**
   - 初始化项目结构、Tailwind、上传与预览模块
   - ✅ 完成后执行 `git add . && git commit -m "init project structure"`

2. **Stage 2 — 选区功能**
   - 实现矩形、画笔、橡皮擦逻辑
   - ✅ Git 存档：`git commit -m "add selection tools"`

3. **Stage 3 — 图像处理算法**
   - 实现马赛克与模糊算法
   - ✅ Git 存档：`git commit -m "implement mosaic and blur"`

4. **Stage 4 — 导出与撤销**
   - 实现导出逻辑与撤销栈
   - ✅ Git 存档：`git commit -m "add export and undo"`

5. **Stage 5 — 联系我模块**
   - 实现二维码展示与替换逻辑（方案 A 或 B）
   - ✅ Git 存档：`git commit -m "add contact module"`

6. **Stage 6 — 测试与上线**
   - 测试功能完整性，部署至 Vercel / Netlify  
   - ✅ Git 存档：`git commit -m "final build and deploy"`

---

## 9. 验收清单
- [ ] 图片上传与预览正常  
- [ ] 矩形、画笔、橡皮功能可用  
- [ ] 马赛克与模糊生效  
- [ ] 导出文件正确  
- [ ] 撤销功能可用  
- [ ] 联系我模块可替换二维码  
- [ ] Git 历史记录完整清晰  

---

## 10. 安全与隐私
- 所有图像在本地浏览器处理，不上传任何服务器。  
- 联系我模块中使用的二维码需确保合法来源，不含个人隐私信息。  

---

## 附录：文件夹说明  

- **`src`**：项目源码目录。包含所有 React 组件、逻辑代码、样式与工具函数。  
- **`components`**：放置复用 UI 组件。  
  - 每个组件独立成文件或文件夹。  
  - 不直接操作全局状态，使用 props 传参。  
  - 示例：`MosaicCanvas.jsx` 负责图像绘制与交互；`Toolbar.jsx` 负责控制按钮逻辑。  
- **`utils`**：通用函数，如图像处理算法。  
- **`hooks`**：自定义 React Hooks。  
- **`public`**：静态资源目录，放置 favicon、默认二维码等。

---

✅ **开发约定：**  
每完成一个阶段的主要功能，必须执行一次 **Git 存档**，并使用有意义的提交信息。  
提交历史将作为版本记录与功能里程碑依据。
