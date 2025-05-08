import { ref } from 'vue';

export function useScrollLock() {
  const scrollPosition = ref(0);
  const isLocked = ref(false);

  // 鎖定螢幕滾動
  const lockScroll = () => {
    if (isLocked.value) return;
    
    scrollPosition.value = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollPosition.value}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.width = '100%';
    document.body.style.overflowY = 'scroll'; // 保留捲軸寬度
    isLocked.value = true;
  };

  // 解鎖螢幕滾動
  const unlockScroll = () => {
    if (!isLocked.value) return;
    
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.right = '';
    document.body.style.width = '';
    document.body.style.overflowY = '';
    
    window.scrollTo(0, scrollPosition.value); // 回到原來位置
    isLocked.value = false;
  };

  return {
    isLocked,
    lockScroll,
    unlockScroll
  };
}