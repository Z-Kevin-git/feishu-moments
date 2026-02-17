const express = require('express');
const db = require('../config/db');
const auth = require('../middleware/auth');
const feishuClient = require('../config/feishu');

const router = express.Router();

// POST /api/posts/:id/share - 转发帖子到群聊/私聊
router.post('/:id/share', auth, async (req, res) => {
  try {
    const postId = req.params.id;
    const { target_type, target_id } = req.body;
    // target_type: "chat_id" | "open_id"
    // target_id: 群聊ID 或 用户open_id

    if (!target_type || !target_id) {
      return res.status(400).json({ error: '缺少转发目标' });
    }

    if (!['chat_id', 'open_id'].includes(target_type)) {
      return res.status(400).json({ error: '不支持的目标类型' });
    }

    // 获取帖子信息
    const [posts] = await db.execute(
      `SELECT p.*, u.name AS author_name, u.avatar_url AS author_avatar
       FROM posts p JOIN users u ON p.user_id = u.id
       WHERE p.id = ?`,
      [postId]
    );

    if (posts.length === 0) {
      return res.status(404).json({ error: '帖子不存在' });
    }

    const post = posts[0];
    const appUrl = process.env.APP_URL || 'https://your-domain.com';
    const postUrl = `${appUrl}/post/${postId}`;

    // 构建消息卡片
    const contentText = post.content
      ? post.content.length > 100
        ? post.content.slice(0, 100) + '...'
        : post.content
      : '分享了一条动态';

    const card = {
      config: { wide_screen_mode: true, enable_forward: true },
      header: {
        title: { tag: 'plain_text', content: `${post.author_name} 的动态` },
        template: 'blue',
      },
      elements: [
        {
          tag: 'div',
          text: { tag: 'plain_text', content: contentText },
        },
        {
          tag: 'action',
          actions: [
            {
              tag: 'button',
              text: { tag: 'plain_text', content: '查看详情' },
              type: 'primary',
              url: postUrl,
            },
          ],
        },
        {
          tag: 'note',
          elements: [
            {
              tag: 'plain_text',
              content: `${req.user.name} 分享 · ❤️ ${post.like_count} · 💬 ${post.comment_count}`,
            },
          ],
        },
      ],
    };

    // 如果有图片，在正文后插入第一张图片
    const images = typeof post.images === 'string' ? JSON.parse(post.images) : post.images;
    if (images && images.length > 0) {
      // 注意：飞书卡片中的图片需要使用 img_key，这里需要先上传到飞书
      // 简化处理：用链接形式展示
      card.elements.splice(1, 0, {
        tag: 'div',
        text: { tag: 'lark_md', content: `[📷 包含 ${images.length} 张图片]` },
      });
    }

    // 发送消息
    await feishuClient.im.message.create({
      params: { receive_id_type: target_type },
      data: {
        receive_id: target_id,
        msg_type: 'interactive',
        content: JSON.stringify(card),
      },
    });

    res.json({ success: true });
  } catch (err) {
    console.error('转发失败:', err);
    res.status(500).json({ error: '转发失败' });
  }
});

module.exports = router;
