import { Routes, Route } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Feed from './pages/Feed';
import PostDetail from './pages/PostDetail';

export default function App() {
  const { user, loading, error, login } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-feishu-blue border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-gray-400 mt-3">登录中...</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-gray-600 mb-4">{error || '请登录'}</p>
          <button
            onClick={login}
            className="px-6 py-2 bg-feishu-blue text-white rounded-lg text-sm"
          >
            重新登录
          </button>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Feed user={user} />} />
      <Route path="/post/:id" element={<PostDetail user={user} />} />
    </Routes>
  );
}
