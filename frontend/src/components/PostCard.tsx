import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Avatar from './Avatar';
import ImageGrid from './ImageGrid';
import { api } from '../api/request';
import { mockApi } from '../api/mock';
import { isInFeishu } from '../utils/feishu';
import { timeAgo } from '../utils/time';
import type { Post, Comment } from '../api/types';

const isMock = import.meta.env.DEV && !isInFeishu();

interface PostCardProps {
  post: Post;
  onUpdate: (postId: number, updates: Partial<Post>) => void;
  onDelete?: (postId: number) => void;
  currentUserId?: number;
}

export default function PostCard({ post, onUpdate, onDelete, currentUserId }: PostCardProps) {
  const navigate = useNavigate();
  const [commenting, setCommenting] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleLike = async () => {
    try {
      let data: { liked: boolean; like_count: number };
      if (isMock) {
        data = mockApi.toggleLike(post.id);
      } else {
        data = await api.post<{ liked: boolean; like_count: number }>(
          `/posts/${post.id}/like`
        );
      }
      onUpdate(post.id, { is_liked: data.liked, like_count: data.like_count });
    } catch (err) {
      console.error('点赞失败:', err);
    }
  };

  const handleComment = async () => {
    if (!commentText.trim() || submitting) return;
    setSubmitting(true);

    try {
      let comment: Comment;
      if (isMock) {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        comment = mockApi.addComment(post.id, commentText.trim(), user);
      } else {
        comment = await api.post<Comment>(`/posts/${post.id}/comments`, {
          content: commentText.trim(),
        });
      }

      const newComments = [...(post.recent_comments || []), comment].slice(-2);
      onUpdate(post.id, {
        comment_count: post.comment_count + 1,
        recent_comments: newComments,
      });

      setCommentText('');
      setCommenting(false);
    } catch (err) {
      console.error('评论失败:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('确定要删除这条动态吗？')) return;
    try {
      if (isMock) {
        mockApi.deletePost(post.id);
      } else {
        await api.delete(`/posts/${post.id}`);
      }
      onDelete?.(post.id);
    } catch (err) {
      console.error('删除失败:', err);
    }
  };

  const images = typeof post.images === 'string' ? JSON.parse(post.images) : (post.images || []);

  return (
    <div className="bg-white px-4 py-3 border-b border-gray-100">
      {/* 头部：头像 + 名字 + 时间 */}
      <div className="flex items-start gap-3">
        <Avatar src={post.author_avatar} name={post.author_name} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="font-medium text-feishu-blue text-[15px]">
              {post.author_name}
            </span>
            {currentUserId === post.user_id && (
              <button
                onClick={handleDelete}
                className="text-xs text-gray-400 hover:text-red-500"
              >
                删除
              </button>
            )}
          </div>

          {/* 正文 */}
          {post.content && (
            <p className="text-[15px] text-gray-800 mt-1 whitespace-pre-wrap break-words leading-relaxed">
              {post.content}
            </p>
          )}

          {/* 图片 */}
          <ImageGrid images={images} />

          {/* 时间 + 操作栏 */}
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-400">{timeAgo(post.created_at)}</span>

            <div className="flex items-center gap-4">
              {/* 点赞 */}
              <button
                onClick={handleLike}
                className={`flex items-center gap-1 text-sm ${
                  post.is_liked ? 'text-red-500' : 'text-gray-500'
                }`}
              >
                <span>{post.is_liked ? '♥' : '♡'}</span>
                {post.like_count > 0 && <span>{post.like_count}</span>}
              </button>

              {/* 评论 */}
              <button
                onClick={() => setCommenting(!commenting)}
                className="flex items-center gap-1 text-sm text-gray-500"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                {post.comment_count > 0 && <span>{post.comment_count}</span>}
              </button>

              {/* 分享 */}
              <button
                onClick={() => navigate(`/post/${post.id}?share=1`)}
                className="text-sm text-gray-500"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* 评论区（最近2条） */}
          {post.recent_comments && post.recent_comments.length > 0 && (
            <div className="mt-2 bg-gray-50 rounded px-3 py-2 space-y-1">
              {post.recent_comments.map((c) => (
                <div key={c.id} className="text-sm">
                  <span className="font-medium text-feishu-blue">{c.author_name}</span>
                  {c.reply_to_name && (
                    <>
                      <span className="text-gray-400"> 回复 </span>
                      <span className="font-medium text-feishu-blue">{c.reply_to_name}</span>
                    </>
                  )}
                  <span className="text-gray-600">：{c.content}</span>
                </div>
              ))}
              {post.comment_count > 2 && (
                <button
                  onClick={() => navigate(`/post/${post.id}`)}
                  className="text-xs text-feishu-blue"
                >
                  查看全部 {post.comment_count} 条评论
                </button>
              )}
            </div>
          )}

          {/* 评论输入框 */}
          {commenting && (
            <div className="mt-2 flex gap-2">
              <input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="写评论..."
                className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-3 py-1.5 text-sm outline-none focus:border-feishu-blue"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleComment()}
              />
              <button
                onClick={handleComment}
                disabled={!commentText.trim() || submitting}
                className="px-3 py-1.5 bg-feishu-blue text-white rounded-full text-sm disabled:opacity-50"
              >
                发送
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
