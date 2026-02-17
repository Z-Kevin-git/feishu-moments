const express = require('express');
const db = require('../config/db');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /api/posts/:id/comments - 获取评论列表
router.get('/:id/comments', auth, async (req, res) => {
  try {
    const postId = req.params.id;

    // 获取所有顶级评论
    const [topComments] = await db.execute(
      `SELECT c.id, c.content, c.parent_id, c.created_at, c.user_id,
              u.name AS author_name, u.avatar_url AS author_avatar
       FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.post_id = ? AND c.parent_id IS NULL
       ORDER BY c.created_at ASC`,
      [postId]
    );

    // 获取所有回复
    const [replies] = await db.execute(
      `SELECT c.id, c.content, c.parent_id, c.reply_to_user_id, c.created_at, c.user_id,
              u.name AS author_name, u.avatar_url AS author_avatar,
              ru.name AS reply_to_name
       FROM comments c
       JOIN users u ON c.user_id = u.id
       LEFT JOIN users ru ON c.reply_to_user_id = ru.id
       WHERE c.post_id = ? AND c.parent_id IS NOT NULL
       ORDER BY c.created_at ASC`,
      [postId]
    );

    // 组装成树形结构
    const replyMap = {};
    for (const reply of replies) {
      if (!replyMap[reply.parent_id]) replyMap[reply.parent_id] = [];
      replyMap[reply.parent_id].push(reply);
    }

    const result = topComments.map((c) => ({
      ...c,
      replies: replyMap[c.id] || [],
    }));

    res.json(result);
  } catch (err) {
    console.error('获取评论失败:', err);
    res.status(500).json({ error: '获取评论失败' });
  }
});

// POST /api/posts/:id/comments - 发表评论/回复
router.post('/:id/comments', auth, async (req, res) => {
  const conn = await db.getConnection();
  try {
    const postId = req.params.id;
    const userId = req.user.id;
    const { content, parent_id, reply_to_user_id } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: '评论内容不能为空' });
    }

    await conn.beginTransaction();

    const [result] = await conn.execute(
      'INSERT INTO comments (post_id, user_id, parent_id, reply_to_user_id, content) VALUES (?, ?, ?, ?, ?)',
      [postId, userId, parent_id || null, reply_to_user_id || null, content.trim()]
    );

    await conn.execute('UPDATE posts SET comment_count = comment_count + 1 WHERE id = ?', [postId]);

    await conn.commit();

    res.json({
      id: result.insertId,
      post_id: parseInt(postId),
      user_id: userId,
      parent_id: parent_id || null,
      reply_to_user_id: reply_to_user_id || null,
      content: content.trim(),
      author_name: req.user.name,
      author_avatar: req.user.avatar_url,
      created_at: new Date().toISOString(),
    });
  } catch (err) {
    await conn.rollback();
    console.error('发表评论失败:', err);
    res.status(500).json({ error: '评论失败' });
  } finally {
    conn.release();
  }
});

module.exports = router;
