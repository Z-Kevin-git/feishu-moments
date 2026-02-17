const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/auth');

const router = express.Router();

// 确保上传目录存在
const uploadDir = process.env.UPLOAD_DIR || './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // 按年月分目录
    const dir = path.join(uploadDir, new Date().toISOString().slice(0, 7));
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
    cb(null, name);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = /^image\/(jpeg|jpg|png|gif|webp)$/;
    if (allowed.test(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('只支持 jpg/png/gif/webp 格式'));
    }
  },
});

// POST /api/upload - 上传图片（支持多张）
router.post('/', auth, upload.array('images', 9), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: '没有上传文件' });
  }

  const urls = req.files.map((f) => {
    // 返回相对路径，前端通过 /uploads/... 访问
    const relative = path.relative(uploadDir, f.path).replace(/\\/g, '/');
    return `/uploads/${relative}`;
  });

  res.json({ urls });
});

// 错误处理
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: '文件大小不能超过10MB' });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ error: '最多上传9张图片' });
    }
  }
  if (err.message) {
    return res.status(400).json({ error: err.message });
  }
  next(err);
});

module.exports = router;
