require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const likeRoutes = require('./routes/likes');
const commentRoutes = require('./routes/comments');
const uploadRoutes = require('./routes/upload');
const shareRoutes = require('./routes/share');

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors());
app.use(express.json());

// 静态文件：上传的图片
const uploadDir = process.env.UPLOAD_DIR || './uploads';
app.use('/uploads', express.static(path.resolve(uploadDir)));

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/posts', likeRoutes);    // /api/posts/:id/like
app.use('/api/posts', commentRoutes); // /api/posts/:id/comments
app.use('/api/posts', shareRoutes);   // /api/posts/:id/share
app.use('/api/upload', uploadRoutes);

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// 全局错误处理
app.use((err, req, res, next) => {
  console.error('未处理的错误:', err);
  res.status(500).json({ error: '服务器内部错误' });
});

app.listen(PORT, () => {
  console.log(`飞书朋友圈后端服务启动 -> http://localhost:${PORT}`);
});
