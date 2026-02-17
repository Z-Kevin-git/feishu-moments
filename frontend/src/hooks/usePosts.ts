import { useState, useCallback, useRef } from 'react';
import { api } from '../api/request';
import { mockApi } from '../api/mock';
import { isInFeishu } from '../utils/feishu';
import type { Post, FeedResponse } from '../api/types';

const isMock = import.meta.env.DEV && !isInFeishu();

export function usePosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const pageRef = useRef(1);

  const fetchPosts = useCallback(async (reset = false) => {
    if (loading) return;
    setLoading(true);

    try {
      if (reset) {
        pageRef.current = 1;
      }

      let data: FeedResponse;
      if (isMock) {
        data = mockApi.getPosts(pageRef.current, 20);
      } else {
        data = await api.get<FeedResponse>(
          `/posts?page=${pageRef.current}&limit=20`
        );
      }

      if (reset) {
        setPosts(data.posts);
      } else {
        setPosts((prev) => [...prev, ...data.posts]);
      }

      setHasMore(data.posts.length === 20);
      pageRef.current += 1;
    } catch (err) {
      console.error('获取帖子失败:', err);
    } finally {
      setLoading(false);
    }
  }, [loading]);

  const addPost = useCallback((post: Post) => {
    setPosts((prev) => [post, ...prev]);
  }, []);

  const updatePost = useCallback((postId: number, updates: Partial<Post>) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, ...updates } : p))
    );
  }, []);

  const removePost = useCallback((postId: number) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  }, []);

  return { posts, loading, hasMore, fetchPosts, addPost, updatePost, removePost };
}
