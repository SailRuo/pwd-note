let clearTimer: ReturnType<typeof setTimeout> | null = null;

export async function copyToClipboard(
  text: string,
  autoClearSeconds: number = 30
): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);

    // 清除上一个定时器
    if (clearTimer) {
      clearTimeout(clearTimer);
      clearTimer = null;
    }

    // 设置倒计时清除剪贴板
    if (autoClearSeconds > 0) {
      clearTimer = setTimeout(async () => {
        try {
          // 仅当剪贴板内容仍与复制时一致时才清除
          const current = await navigator.clipboard.readText();
          if (current === text) {
            await navigator.clipboard.writeText('');
            console.log('剪贴板已出于安全保护自动清空');
          }
        } catch {
          // 浏览器可能没有读取权限，直接忽略
        }
      }, autoClearSeconds * 1000);
    }

    return true;
  } catch (err) {
    console.error('复制失败:', err);
    return false;
  }
}
