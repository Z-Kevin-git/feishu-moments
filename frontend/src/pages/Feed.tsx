import { useEffect, useRef, useState, useCallback } from 'react';
import PostCard from '../components/PostCard';
import CreatePost from '../components/CreatePost';
import { usePosts } from '../hooks/usePosts';
import type { User } from '../api/types';

interface FeedProps {
  user: User;
}

export default function Feed({ user }: FeedProps) {
  const { posts, loading, hasMore, fetchPosts, addPost, updatePost, removePost } = usePosts();
  const [showCreate, setShowCreate] = useState(false);
  const loaderRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  // 首次加载
  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      fetchPosts(true);
    }
  }, [fetchPosts]);

  // 无限滚动
  const handleScroll = useCallback(() => {
    if (!loaderRef.current || loading || !hasMore) return;

    const rect = loaderRef.current.getBoundingClientRect();
    if (rect.top < window.innerHeight + 200) {
      fetchPosts();
    }
  }, [loading, hasMore, fetchPosts]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // 下拉刷新（简单实现）
  const handleRefresh = () => {
    fetchPosts(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-30 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-900">朋友圈</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="w-8 h-8 bg-feishu-blue text-white rounded-lg flex items-center justify-center"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </header>

      {/* 下拉刷新按钮 */}
      <div className="text-center py-2">
        <button
          onClick={handleRefresh}
          className="text-xs text-gray-400 hover:text-feishu-blue"
        >
          {loading && posts.length === 0 ? '加载中...' : '刷新'}
        </button>
      </div>

      {/* 帖子列表 */}
      <div>
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onUpdate={updatePost}
            onDelete={removePost}
            currentUserId={user.id}
          />
        ))}
      </div>

      {/* 加载更多 */}
      <div ref={loaderRef} className="py-6 text-center text-sm text-gray-400">
        {loading && '加载中...'}
        {!loading && !hasMore && posts.length > 0 && '没有更多了'}
        {!loading && posts.length === 0 && '还没有人发过动态，快来发第一条吧！'}
      </div>

      {/* 发帖弹窗 */}
      {showCreate && (
        <CreatePost
          onCreated={addPost}
          onClose={() => setShowCreate(false)}
        />
      )}
    </div>
  );
}
