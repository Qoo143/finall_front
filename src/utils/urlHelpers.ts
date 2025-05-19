/**
 * 格式化圖片URL - 將相對路徑轉為完整URL
 * @param {string} url - 圖片URL或路徑
 * @returns {string} 格式化後的URL
 */
export function getImageUrl(url?: string): string {
  if (!url) return "/img/placeholder.png";
  
  // 如果已經是完整的URL (Cloudinary或其他雲端服務)
  if (url.startsWith('http')) return url;
  
  // 相對路徑轉為完整URL (本地環境)
  return `http://127.0.0.1:3007${url}`;
}

/**
 * 格式化模型URL - 將相對路徑轉為完整URL
 * @param {string} url - 模型URL或路徑
 * @returns {string} 格式化後的URL
 */
export function getModelUrl(url?: string): string {
  if (!url) return "";
  
  // 如果已經是完整的URL (Cloudinary或其他雲端服務)
  if (url.startsWith('http')) return url;
  
  // 相對路徑轉為完整URL (本地環境)
  return `http://127.0.0.1:3007${url}`;
}

/**
 * 判斷URL是否為 Cloudinary URL
 * @param {string} url - 要檢查的URL
 * @returns {boolean} 是否為 Cloudinary URL
 */
export function isCloudinaryUrl(url?: string): boolean {
  if (!url || typeof url !== 'string') return false;
  return url.includes('cloudinary.com');
}