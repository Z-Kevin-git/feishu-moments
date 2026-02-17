const express = require('express');
const db = require('../config/db');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /api/posts - 获取 Feed（分页）
router.get('/', auth, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;
    const userId = req.user.id;

    const [posts] = await db.execute(
      `SELECT p.*, u.name AS author_name, u.avatar_url AS author_avatar,
              EXISTS(SELECT 1 FROM likes WHERE post_id = p.id AND user_id = ?) AS is_liked
       FROM posts p
       JOIN users u ON p.user_id = u.id
       ORDER BY p.created_at DESC
       LIMIT ? OFFSET ?`,
      [userId, limit, offset]
    );

    // 为每个帖子获取最新2条评论
    for (const post of posts) {
      const [comments] = await db.execute(
        `SELECT c.id, c.content, c.parent_id, c.created_at,
                u.name AS author_name, u.avatar_url AS author_avatar,
                ru.name AS reply_to_name
         FROM comments c
         JOIN users u ON c.user_id = u.id
         LEFT JOIN users ru ON c.reply_to_user_id = ru.id
         WHERE c.post_id = ? AND c.parent_id IS NULL
         ORDER BY c.created_at DESC
         LIMIT 2`,
        [post.id]
      );
      post.recent_comments = comments;
      post.is_liked = !!post.is_liked;
    }

    res.json({ posts, page, limit });
  } catch (err) {
    console.error('获取帖子列表失败:', err);
    res.status(500).json({ error: '获取帖子失败' });
  }
});

// GET /api/posts/:id - 帖子详情
router.get('/:id', auth, async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id;

    const [posts] = await db.execute(
      `SELECT p.*, u.name AS author_name, u.avatar_url AS author_avatar,
              EXISTS(SELECT 1 FROM likes WHERE post_id = p.id AND user_id = ?) AS is_liked
       FROM posts p
       JOIN users u ON p.user_id = u.id
       WHERE p.id = ?`,
      [userId, postId]
    );

    if (posts.length === 0) {
      return res.status(404).json({ error: '帖子不存在' });
    }

    const post = posts[0];
    post.is_liked = !!post.is_liked;

    // 获取点赞用户列表
    const [likeUsers] = await db.execute(
      `SELECT u.id, u.name, u.avatar_url
       FROM likes l JOIN users u ON l.user_id = u.id
       WHERE l.post_id = ?
       ORDER BY l.created_at DESC
       LIMIT 20`,
      [postId]
    );
    post.like_users = likeUsers;

    res.json(post);
  } catch (err) {
    console.error('获取帖子详情失败:', err);
    res.status(500).json({ error: '获取帖子详情失败' });
  }
});

// POST /api/posts - 发帖
router.post('/', auth, async (req, res) => {
  try {
    const { content, images } = req.body;
    const userId = req.user.id;

    if (!content && (!images || images.length === 0)) {
      return res.status(400).json({ error: '内容不能为空' });
    }

    if (images && images.length > 9) {
      return res.status(400).json({ error: '最多上传9张图片' });
    }

    const [result] = await db.execute(
      'INSERT INTO posts (user_id, content, images) VALUES (?, ?, ?)',
      [userId, content || '', JSON.stringify(images || [])]
    );

    res.json({
      id: result.insertId,
      user_id: userId,
      content: content || '',
      images: images || [],
      like_count: 0,
      comment_count: 0,
      author_name: req.user.name,
      author_avatar: req.user.avatar_url,
      is_liked: false,
      recent_comments: [],
      created_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error('发帖失败:', err);
    res.status(500).json({ error: '发帖失败' });
  }
});

// DELETE /api/posts/:id - 删除帖子（只能删自己的）
router.delete('/:id', auth, async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id;

    const [result] = await db.execute(
      'DELETE FROM posts WHERE id = ? AND user_id = ?',
      [postId, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: '帖子不存在或无权删除' });
    }

    res.json({ success: true });
  } catch (err) {
    console.error('删除帖子失败:', err);
    res.status(500).json({ error: '删除帖子失败' });
  }
});

module.exports = router;
