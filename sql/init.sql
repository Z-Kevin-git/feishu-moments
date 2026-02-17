-- 飞书朋友圈 数据库初始化
CREATE DATABASE IF NOT EXISTS feishu_moments DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE feishu_moments;

-- 用户表（从飞书同步）
CREATE TABLE IF NOT EXISTS users (
  id          INT PRIMARY KEY AUTO_INCREMENT,
  open_id     VARCHAR(100) UNIQUE NOT NULL COMMENT '飞书 open_id',
  union_id    VARCHAR(100) DEFAULT NULL COMMENT '飞书 union_id',
  name        VARCHAR(100) NOT NULL DEFAULT '' COMMENT '用户昵称',
  avatar_url  TEXT COMMENT '头像URL',
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_open_id (open_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 帖子表
CREATE TABLE IF NOT EXISTS posts (
  id            INT PRIMARY KEY AUTO_INCREMENT,
  user_id       INT NOT NULL COMMENT '作者ID',
  content       TEXT COMMENT '文字内容',
  images        JSON COMMENT '图片URL数组',
  like_count    INT NOT NULL DEFAULT 0,
  comment_count INT NOT NULL DEFAULT 0,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_created_at (created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 点赞表
CREATE TABLE IF NOT EXISTS likes (
  id         INT PRIMARY KEY AUTO_INCREMENT,
  post_id    INT NOT NULL,
  user_id    INT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_post_user (post_id, user_id),
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_post_id (post_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 评论表（评论+回复统一存储）
CREATE TABLE IF NOT EXISTS comments (
  id               INT PRIMARY KEY AUTO_INCREMENT,
  post_id          INT NOT NULL,
  user_id          INT NOT NULL COMMENT '评论者',
  parent_id        INT DEFAULT NULL COMMENT 'NULL=顶级评论，非NULL=回复某条评论',
  reply_to_user_id INT DEFAULT NULL COMMENT '被回复的人',
  content          TEXT NOT NULL,
  created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_post_id (post_id),
  INDEX idx_parent_id (parent_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
