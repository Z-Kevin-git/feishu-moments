import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import Avatar from '../components/Avatar';
import ImageGrid from '../components/ImageGrid';
import { api } from '../api/request';
import { mockApi } from '../api/mock';
import { isInFeishu } from '../utils/feishu';
import { timeAgo } from '../utils/time';
import type { Post, Comment, User } from '../api/types';

const isMock = import.meta.env.DEV && !isInFeishu();

interface PostDetailProps {
  user: User;
}

export default function PostDetail({ user }: PostDetailProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<(Comment & { replies: Comment[] })[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [replyTo, setReplyTo] = useState<{ id: number; userId: number; name: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;

    const load = async () => {
      try {
        if (isMock) {
          const postData = mockApi.getPost(parseInt(id));
          const commentsData = mockApi.getComments(parseInt(id));
          setPost(postData);
          setComments(commentsData);
        } else {
          const [postData, commentsData] = await Promise.all([
            api.get<Post>(`/posts/${id}`),
            api.get<(Comment & { replies: Comment[] })[]>(`/posts/${id}/comments`),
          ]);
          setPost(postData);
          setComments(commentsData);
        }
      } catch (err) {
        console.error('加载失败:', err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  const handleLike = async () => {
    if (!post) return;
    try {
      let data: { liked: boolean; like_count: number };
      if (isMock) {
        data = mockApi.toggleLike(post.id);
      } else {
        data = await api.post<{ liked: boolean; like_count: number }>(
          `/posts/${post.id}/like`
        );
      }
      setPost({ ...post, is_liked: data.liked, like_count: data.like_count });
    } catch (err) {
      console.error('点赞失败:', err);
    }
  };

  const handleComment = async () => {
    if (!commentText.trim() || submitting || !post) return;
    setSubmitting(true);

    try {
      let comment: Comment;
      if (isMock) {
        comment = mockApi.addComment(
          post.id, commentText.trim(), user,
          replyTo?.id, replyTo?.userId, replyTo?.name
        );
      } else {
        comment = await api.post<Comment>(`/posts/${post.id}/comments`, {
          content: commentText.trim(),
          parent_id: replyTo?.id || undefined,
          reply_to_user_id: replyTo?.userId || undefined,
        });
      }

      if (replyTo) {
        // 回复：添加到对应评论的 replies 中
        setComments((prev) =>
          prev.map((c) =>
            c.id === replyTo.id
              ? { ...c, replies: [...(c.replies || []), comment] }
              : c
          )
        );
      } else {
        // 新评论
        setComments((prev) => [...prev, { ...comment, replies: [] }]);
      }

      setPost({ ...post, comment_count: post.comment_count + 1 });
      setCommentText('');
      setReplyTo(null);
    } catch (err) {
      console.error('评论失败:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleShare = async () => {
    // TODO: 接入飞书 JSSDK 的分享选择器
    // 简化实现：复制链接
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      alert('链接已复制，可粘贴到飞书聊天中分享');
    } catch {
      alert('链接: ' + url);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <span className="text-gray-400">加载中...</span>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <span className="text-gray-400">帖子不存在</span>
        <button onClick={() => navigate('/')} className="text-feishu-blue text-sm">
          返回首页
        </button>
      </div>
    );
  }

  const images = typeof post.images === 'string' ? JSON.parse(post.images) : (post.images || []);

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-30 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-gray-600">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="font-medium">动态详情</span>
      </header>

      {/* 帖子内容 */}
      <div className="bg-white px-4 py-4">
        <div className="flex items-center gap-3 mb-3">
          <Avatar src={post.author_avatar} name={post.author_name} size={44} />
          <div>
            <div className="font-medium text-feishu-blue">{post.author_name}</div>
            <div className="text-xs text-gray-400">{timeAgo(post.created_at)}</div>
          </div>
        </div>

        {post.content && (
          <p className="text-[15px] text-gray-800 whitespace-pre-wrap break-words leading-relaxed">
            {post.content}
          </p>
        )}

        <ImageGrid images={images} />

        {/* 操作栏 */}
        <div className="flex items-center gap-6 mt-4 pt-3 border-t border-gray-100">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1.5 ${post.is_liked ? 'text-red-500' : 'text-gray-500'}`}
          >
            <span className="text-lg">{post.is_liked ? '♥' : '♡'}</span>
            <span className="text-sm">{post.like_count || '赞'}</span>
          </button>
          <button
            onClick={() => { setReplyTo(null); document.getElementById('comment-input')?.focus(); }}
            className="flex items-center gap-1.5 text-gray-500"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <span className="text-sm">{post.comment_count || '评论'}</span>
          </button>
          <button onClick={handleShare} className="flex items-center gap-1.5 text-gray-500">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
              />
            </svg>
            <span className="text-sm">分享</span>
          </button>
        </div>

        {/* 点赞用户列表 */}
        {post.like_users && post.like_users.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-1 flex-wrap">
            <span className="text-red-500 text-sm mr-1">♥</span>
            {post.like_users.map((u, i) => (
              <span key={u.id} className="text-sm text-feishu-blue">
                {u.name}{i < post.like_users!.length - 1 ? '、' : ''}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 评论列表 */}
      {comments.length > 0 && (
        <div className="bg-white mt-2 px-4 py-3">
          <div className="text-sm font-medium text-gray-600 mb-3">
            评论 ({post.comment_count})
          </div>
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id}>
                {/* 顶级评论 */}
                <div className="flex gap-2">
                  <Avatar src={comment.author_avatar} name={comment.author_name} size={32} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-feishu-blue">{comment.author_name}</span>
                      <span className="text-xs text-gray-400">{timeAgo(comment.created_at)}</span>
                    </div>
                    <p className="text-sm text-gray-700 mt-0.5">{comment.content}</p>
                    <button
                      onClick={() => setReplyTo({ id: comment.id, userId: comment.user_id, name: comment.author_name })}
                      className="text-xs text-gray-400 mt-1"
                    >
                      回复
                    </button>
                  </div>
                </div>

                {/* 回复列表 */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="ml-10 mt-2 space-y-2">
                    {comment.replies.map((reply) => (
                      <div key={reply.id} className="flex gap-2">
                        <Avatar src={reply.author_avatar} name={reply.author_name} size={24} />
                        <div className="flex-1">
                          <div className="text-sm">
                            <span className="font-medium text-feishu-blue">{reply.author_name}</span>
                            {reply.reply_to_name && (
                              <>
                                <span className="text-gray-400"> 回复 </span>
                                <span className="font-medium text-feishu-blue">{reply.reply_to_name}</span>
                              </>
                            )}
                          </div>
                          <p className="text-sm text-gray-700 mt-0.5">{reply.content}</p>
                          <span className="text-xs text-gray-400">{timeAgo(reply.created_at)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 底部评论输入框 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-2 flex gap-2 items-center">
        {replyTo && (
          <div className="absolute -top-8 left-0 right-0 bg-gray-100 px-4 py-1 text-xs text-gray-500 flex items-center justify-between">
            <span>回复 {replyTo.name}</span>
            <button onClick={() => setReplyTo(null)} className="text-gray-400">x</button>
          </div>
        )}
        <input
          id="comment-input"
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder={replyTo ? `回复 ${replyTo.name}...` : '写评论...'}
          className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-feishu-blue"
          onKeyDown={(e) => e.key === 'Enter' && handleComment()}
        />
        <button
          onClick={handleComment}
          disabled={!commentText.trim() || submitting}
          className="px-4 py-2 bg-feishu-blue text-white rounded-full text-sm disabled:opacity-50 flex-shrink-0"
        >
          发送
        </button>
      </div>
    </div>
  );
}
