const express = require('express');
const db = require('../config/db');
const auth = require('../middleware/auth');

const router = express.Router();

// POST /api/posts/:id/like - 点赞/取消点赞 (toggle)
router.post('/:id/like', auth, async (req, res) => {
  const conn = await db.getConnection();
  try {
    const postId = req.params.id;
    const userId = req.user.id;

    await conn.beginTransaction();

    // 检查是否已点赞
    const [existing] = await conn.execute(
      'SELECT id FROM likes WHERE post_id = ? AND user_id = ?',
      [postId, userId]
    );

    let liked;
    if (existing.length > 0) {
      // 取消点赞
      await conn.execute('DELETE FROM likes WHERE post_id = ? AND user_id = ?', [postId, userId]);
      await conn.execute('UPDATE posts SET like_count = GREATEST(like_count - 1, 0) WHERE id = ?', [postId]);
      liked = false;
    } else {
      // 点赞
      await conn.execute('INSERT INTO likes (post_id, user_id) VALUES (?, ?)', [postId, userId]);
      await conn.execute('UPDATE posts SET like_count = like_count + 1 WHERE id = ?', [postId]);
      liked = true;
    }

    await conn.commit();

    // 返回最新点赞数
    const [rows] = await db.execute('SELECT like_count FROM posts WHERE id = ?', [postId]);
    res.json({ liked, like_count: rows[0]?.like_count || 0 });
  } catch (err) {
    await conn.rollback();
    console.error('点赞操作失败:', err);
    res.status(500).json({ error: '操作失败' });
  } finally {
    conn.release();
  }
});

module.exports = router;
