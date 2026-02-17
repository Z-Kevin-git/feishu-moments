// 飞书 JSSDK 封装
// 在飞书客户端内运行时，window.h5sdk 和 window.tt 可用

declare global {
  interface Window {
    h5sdk: {
      ready: (callback: () => void) => void;
      error: (callback: (err: unknown) => void) => void;
      config: (params: {
        appId: string;
        timestamp: string;
        nonceStr: string;
        signature: string;
        jsApiList: string[];
      }) => void;
    };
    tt: {
      requestAuthCode: (params: {
        appId: string;
        success: (res: { code: string }) => void;
        fail: (err: unknown) => void;
      }) => void;
      showShareSheet?: (params: unknown) => void;
    };
  }
}

const FEISHU_APP_ID = import.meta.env.VITE_FEISHU_APP_ID || '';

export function isInFeishu(): boolean {
  const ua = navigator.userAgent.toLowerCase();
  return ua.includes('lark') || ua.includes('feishu');
}

export function getAuthCode(): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!isInFeishu()) {
      reject(new Error('请在飞书客户端中打开'));
      return;
    }

    window.h5sdk.ready(() => {
      window.tt.requestAuthCode({
        appId: FEISHU_APP_ID,
        success: (res) => resolve(res.code),
        fail: (err) => reject(err),
      });
    });
  });
}
