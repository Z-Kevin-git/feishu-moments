const express = require('express');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const feishuClient = require('../config/feishu');

const router = express.Router();

// POST /api/auth/login
// body: { code } - 飞书免登授权码
router.post('/login', async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ error: '缺少授权码' });
    }

    // 用 code 换取 user_access_token
    const tokenRes = await feishuClient.authen.oidcAccessToken.create({
      data: {
        grant_type: 'authorization_code',
        code,
      },
    });

    if (tokenRes.code !== 0) {
      console.error('飞书换 token 失败:', tokenRes);
      return res.status(400).json({ error: '飞书授权失败' });
    }

    const { access_token } = tokenRes.data;

    // 用 token 获取用户信息
    const userRes = await feishuClient.authen.userInfo.get({
      headers: { Authorization: `Bearer ${access_token}` },
    });

    if (userRes.code !== 0) {
      console.error('获取飞书用户信息失败:', userRes);
      return res.status(400).json({ error: '获取用户信息失败' });
    }

    const { open_id, union_id, name, avatar_url } = userRes.data;

    // 写入或更新用户
    const [rows] = await db.execute(
      'SELECT id, open_id, name, avatar_url FROM users WHERE open_id = ?',
      [open_id]
    );

    let userId;
    if (rows.length > 0) {
      userId = rows[0].id;
      await db.execute(
        'UPDATE users SET name = ?, avatar_url = ?, union_id = ?, updated_at = NOW() WHERE id = ?',
        [name, avatar_url, union_id || null, userId]
      );
    } else {
      const [result] = await db.execute(
        'INSERT INTO users (open_id, union_id, name, avatar_url) VALUES (?, ?, ?, ?)',
        [open_id, union_id || null, name, avatar_url]
      );
      userId = result.insertId;
    }

    // 签发 JWT
    const token = jwt.sign(
      { id: userId, open_id, name, avatar_url },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: { id: userId, open_id, name, avatar_url },
    });
  } catch (err) {
    console.error('登录失败:', err);
    res.status(500).json({ error: '登录失败' });
  }
});

module.exports = router;
