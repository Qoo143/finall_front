// src/utils/tokenManager.ts
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  exp: number;
  id: number;
  account: string;
}

export const tokenManager = {
  // 檢查 token 是否過期
  isTokenExpired(token: string): boolean {
    if (!token || token === '') return true;
    
    try {
      // 移除 Bearer 前綴
      const actualToken = token.startsWith('Bearer ') ? token.substring(7) : token;
      const decoded = jwtDecode<DecodedToken>(actualToken);
      
      // 檢查過期時間 (exp 是以秒為單位的時間戳)
      return decoded.exp * 1000 < Date.now();
    } catch (error) {
      console.error('Token 解析錯誤:', error);
      return true;
    }
  },
  
  // 獲取 token 的過期時間
  getTokenExpirationTime(token: string): number | null {
    if (!token || token === '') return null;
    
    try {
      const actualToken = token.startsWith('Bearer ') ? token.substring(7) : token;
      const decoded = jwtDecode<DecodedToken>(actualToken);
      return decoded.exp * 1000;
    } catch {
      return null;
    }
  }
};

