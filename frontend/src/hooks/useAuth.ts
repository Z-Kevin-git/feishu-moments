import { useState, useEffect, useCallback } from 'react';
import { api } from '../api/request';
import { mockApi } from '../api/mock';
import { isInFeishu, getAuthCode } from '../utils/feishu';
import type { User, LoginResponse } from '../api/types';

const isMock = import.meta.env.DEV && !isInFeishu();

export function useAuth() {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(!user);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (isMock) {
        const data = mockApi.login();
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        return;
      }

      if (!isInFeishu()) {
        setError('请在飞书客户端中打开');
        return;
      }

      const code = await getAuthCode();
      const data = await api.post<LoginResponse>('/auth/login', { code });

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
    } catch (err) {
      console.error('登录失败:', err);
      setError(err instanceof Error ? err.message : '登录失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user) {
      login();
    } else {
      setLoading(false);
    }
  }, [user, login]);

  return { user, loading, error, login };
}
