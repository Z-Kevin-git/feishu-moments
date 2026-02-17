import { useState, useRef } from 'react';
import { api } from '../api/request';
import { mockApi } from '../api/mock';
import { isInFeishu } from '../utils/feishu';
import type { Post } from '../api/types';

const isMock = import.meta.env.DEV && !isInFeishu();

interface CreatePostProps {
  onCreated: (post: Post) => void;
  onClose: () => void;
}

export default function CreatePost({ onCreated, onClose }: CreatePostProps) {
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (files: FileList) => {
    if (images.length + files.length > 9) {
      alert('最多上传9张图片');
      return;
    }

    setUploading(true);
    try {
      if (isMock) {
        // Mock: 用本地 URL 预览
        const urls = Array.from(files).map((f) => URL.createObjectURL(f));
        setImages((prev) => [...prev, ...urls]);
      } else {
        const formData = new FormData();
        Array.from(files).forEach((f) => formData.append('images', f));
        const data = await api.post<{ urls: string[] }>('/upload', formData);
        setImages((prev) => [...prev, ...data.urls]);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : '上传失败');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if ((!content.trim() && images.length === 0) || submitting) return;
    setSubmitting(true);

    try {
      let post: Post;
      if (isMock) {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        post = mockApi.createPost(content.trim(), images, user);
      } else {
        post = await api.post<Post>('/posts', {
          content: content.trim(),
          images,
        });
      }
      onCreated(post);
      onClose();
    } catch (err) {
      alert(err instanceof Error ? err.message : '发布失败');
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit = (content.trim() || images.length > 0) && !submitting && !uploading;

  return (
    <div className="fixed inset-0 bg-black/50 z-40 flex items-end sm:items-center justify-center">
      <div className="bg-white w-full sm:max-w-lg sm:rounded-xl rounded-t-xl max-h-[85vh] flex flex-col">
        {/* 头部 */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <button onClick={onClose} className="text-gray-500 text-sm">
            取消
          </button>
          <span className="font-medium">发布动态</span>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="text-sm font-medium text-white bg-feishu-blue px-4 py-1 rounded-full disabled:opacity-50"
          >
            {submitting ? '发布中...' : '发布'}
          </button>
        </div>

        {/* 内容区 */}
        <div className="flex-1 overflow-y-auto p-4">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="分享你的想法..."
            className="w-full min-h-[120px] resize-none text-[15px] outline-none placeholder:text-gray-400"
            autoFocus
          />

          {/* 已选图片预览 */}
          {images.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mt-2">
              {images.map((url, i) => (
                <div key={i} className="relative aspect-square rounded overflow-hidden bg-gray-100">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <button
                    onClick={() => removeImage(i)}
                    className="absolute top-1 right-1 w-5 h-5 bg-black/60 text-white rounded-full text-xs flex items-center justify-center"
                  >
                    x
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 底部工具栏 */}
        <div className="px-4 py-3 border-t border-gray-100 flex items-center">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => e.target.files && handleUpload(e.target.files)}
          />
          <button
            onClick={() => fileRef.current?.click()}
            disabled={images.length >= 9 || uploading}
            className="flex items-center gap-1 text-sm text-gray-600 disabled:opacity-50"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            {uploading ? '上传中...' : `图片 (${images.length}/9)`}
          </button>
        </div>
      </div>
    </div>
  );
}
