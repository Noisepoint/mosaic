import React, { useState, useCallback } from 'react';

/**
 * 撤销/重做功能的自定义Hook
 * @param {any} initialState - 初始状态
 * @returns {Array} [state, setState, undo, redo, canUndo, canRedo, reset]
 */
export const useUndo = (initialState) => {
  const [past, setPast] = useState([]);
  const [present, setPresent] = useState(initialState);
  const [future, setFuture] = useState([]);

  /**
   * 设置新状态并更新撤销栈
   * @param {any} newState - 新状态
   */
  const setState = useCallback((newState) => {
    setPast(prevPast => [...prevPast, present]);
    setPresent(newState);
    setFuture([]);
  }, [present]);

  /**
   * 撤销操作
   */
  const undo = useCallback(() => {
    if (past.length === 0) return;

    const previous = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);

    setPast(newPast);
    setPresent(previous);
    setFuture(prevFuture => [present, ...prevFuture]);
  }, [past, present]);

  /**
   * 重做操作
   */
  const redo = useCallback(() => {
    if (future.length === 0) return;

    const next = future[0];
    const newFuture = future.slice(1);

    setPast(prevPast => [...prevPast, present]);
    setPresent(next);
    setFuture(newFuture);
  }, [future, present]);

  /**
   * 重置到初始状态
   */
  const reset = useCallback(() => {
    setPast([]);
    setPresent(initialState);
    setFuture([]);
  }, [initialState]);

  /**
   * 检查是否可以撤销
   */
  const canUndo = past.length > 0;

  /**
   * 检查是否可以重做
   */
  const canRedo = future.length > 0;

  /**
   * 获取历史记录长度
   */
  const historyLength = past.length + 1 + future.length;

  /**
   * 获取当前位置在历史记录中的索引
   */
  const currentIndex = past.length;

  /**
   * 跳转到历史记录中的特定状态
   * @param {number} index - 目标索引
   */
  const goTo = useCallback((index) => {
    if (index < 0 || index >= historyLength) return;

    const allStates = [...past, present, ...future];
    const newPast = allStates.slice(0, index);
    const newPresent = allStates[index];
    const newFuture = allStates.slice(index + 1);

    setPast(newPast);
    setPresent(newPresent);
    setFuture(newFuture);
  }, [past, present, future, historyLength]);

  return [
    present,
    setState,
    undo,
    redo,
    canUndo,
    canRedo,
    reset,
    {
      historyLength,
      currentIndex,
      goTo,
      past: [...past],
      future: [...future]
    }
  ];
};

/**
 * 专门用于选区的撤销Hook
 * @param {Array} initialSelections - 初始选区数组
 * @returns {Array} [selections, setSelections, undo, redo, canUndo, canRedo, reset, history]
 */
export const useSelectionUndo = (initialSelections = []) => {
  const [
    selections,
    setSelectionsState,
    undo,
    redo,
    canUndo,
    canRedo,
    reset,
    history
  ] = useUndo(initialSelections);

  /**
   * 设置选区并记录到历史
   * @param {Array|Function} newSelections - 新选区数组或更新函数
   */
  const setSelections = useCallback((newSelections) => {
    console.log('=== setSelections Hook调试 ===');
    console.log('newSelections:', newSelections);
    console.log('当前selections:', selections);

    if (typeof newSelections === 'function') {
      console.log('执行函数更新');
      setSelectionsState(prev => {
        const result = newSelections(prev);
        console.log('函数更新结果:', result);
        return result;
      });
    } else {
      console.log('执行直接更新');
      setSelectionsState([...newSelections]);
    }

    console.log('setSelectionsState调用完成');
  }, [setSelectionsState]); // 移除selections依赖

  /**
   * 添加选区
   * @param {Object} selection - 要添加的选区
   */
  const addSelection = useCallback((selection) => {
    setSelections(prev => [...prev, selection]);
  }, [setSelections]);

  /**
   * 移除选区
   * @param {number} index - 要移除的选区索引
   */
  const removeSelection = useCallback((index) => {
    setSelections(prev => prev.filter((_, i) => i !== index));
  }, [setSelections]);

  /**
   * 清空所有选区
   */
  const clearSelections = useCallback(() => {
    setSelections([]);
  }, [setSelections]);

  /**
   * 更新特定选区
   * @param {number} index - 选区索引
   * @param {Object} updates - 更新内容
   */
  const updateSelection = useCallback((index, updates) => {
    setSelections(prev => prev.map((selection, i) =>
      i === index ? { ...selection, ...updates } : selection
    ));
  }, [setSelections]);

  return [
    selections,
    setSelections,
    undo,
    redo,
    canUndo,
    canRedo,
    reset,
    {
      ...history,
      addSelection,
      removeSelection,
      clearSelections,
      updateSelection
    }
  ];
};

/**
 * 键盘快捷键处理Hook
 * @param {Function} onUndo - 撤销回调
 * @param {Function} onRedo - 重做回调
 * @param {boolean} enabled - 是否启用快捷键
 */
export const useUndoShortcuts = (onUndo, onRedo, enabled = true) => {
  const handleKeyDown = useCallback((event) => {
    if (!enabled) return;

    // Ctrl+Z 撤销
    if ((event.ctrlKey || event.metaKey) && event.key === 'z' && !event.shiftKey) {
      event.preventDefault();
      onUndo?.();
    }

    // Ctrl+Y 或 Ctrl+Shift+Z 重做
    if ((event.ctrlKey || event.metaKey) &&
        (event.key === 'y' || (event.key === 'z' && event.shiftKey))) {
      event.preventDefault();
      onRedo?.();
    }
  }, [onUndo, onRedo, enabled]);

  // 添加键盘事件监听
  React.useEffect(() => {
    if (enabled) {
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [handleKeyDown, enabled]);
};