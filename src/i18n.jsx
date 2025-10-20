import React from 'react';

export const dictionaries = {
  zh: {
    appTitle: '图片打码工具',
    onlineSubtitle: '在线马赛克处理工具',
    startProcessing: '开始处理您的图片',
    uploadHint: '上传图片后，您可以自由选择需要打码的区域，支持马赛克和模糊两种效果',
    changeImage: '更换图片',
    editing: '图片编辑',
    effect: '处理效果',
    mosaic: '马赛克',
    blur: '模糊',
    mosaicSize: '马赛克大小',
    blurStrength: '模糊强度',
    undo: '撤销',
    redo: '恢复',
    exportSettings: '导出设置',
    format: '格式',
    quality: '压缩质量',
    exportImage: '导出图片',
    pleaseSelect: '请先选择打码区域',
    tool: '工具：',
    rectangle: '矩形选区',
    brush: '画笔涂抹',
    size: '大小：',
    clearAll: '清空所有选区',
    tips: '提示：选择工具后在图片上拖拽来选择需要打码区域 • 双击选区可删除',
    coordLabel: '大小',
    language: '语言',
    zhCN: '中文',
    enUS: '英文',
  },
  en: {
    appTitle: 'Image Censor Tool',
    onlineSubtitle: 'Online Mosaic/Blur Tool',
    startProcessing: 'Start processing your image',
    uploadHint: 'After uploading, select areas to censor with Mosaic or Blur',
    changeImage: 'Change Image',
    editing: 'Editing',
    effect: 'Effect',
    mosaic: 'Mosaic',
    blur: 'Blur',
    mosaicSize: 'Mosaic Size',
    blurStrength: 'Blur Strength',
    undo: 'Undo',
    redo: 'Redo',
    exportSettings: 'Export Settings',
    format: 'Format',
    quality: 'Quality',
    exportImage: 'Export Image',
    pleaseSelect: 'Select an area first',
    tool: 'Tool:',
    rectangle: 'Rectangle',
    brush: 'Brush',
    size: 'Size:',
    clearAll: 'Clear All',
    tips: 'Tip: Drag on the image to select areas • Double-click to delete',
    coordLabel: 'Size',
    language: 'Language',
    zhCN: 'Chinese',
    enUS: 'English',
  }
};

export const I18nContext = React.createContext({ lang: 'zh', t: (k) => k, setLang: () => {} });

export const I18nProvider = ({ children }) => {
  const [lang, setLang] = React.useState('zh');
  const t = React.useCallback((key) => dictionaries[lang]?.[key] ?? key, [lang]);
  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => React.useContext(I18nContext);


