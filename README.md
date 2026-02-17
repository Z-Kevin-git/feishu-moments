# 飞书朋友圈 (Feishu Moments)

> 基于飞书开放平台的企业内部社交动态应用，类似微信朋友圈。员工可以发布图文动态、点赞、评论、回复，并将优质内容转发到飞书群聊或私聊。

![Tech Stack](https://img.shields.io/badge/React-18-blue) ![Tech Stack](https://img.shields.io/badge/Node.js-Express-green) ![Tech Stack](https://img.shields.io/badge/MySQL-5.7-orange) ![Tech Stack](https://img.shields.io/badge/飞书-H5应用-purple)

## 功能特性

### 核心功能
- **动态 Feed** — 按时间倒序展示全公司动态，无限滚动加载
- **发布动态** — 支持纯文字 / 图文混排（最多 9 张图片）
- **点赞** — 一键点赞/取消，实时计数
- **评论 & 回复** — 支持多级评论，回复指定用户
- **转发分享** — 以飞书消息卡片形式转发到群聊或私聊，点击卡片跳转回原帖

### 技术亮点
- **飞书免登** — 在飞书客户端打开自动登录，零门槛使用
- **消息卡片** — 转发内容以富文本卡片呈现，支持交互按钮
- **Mock 模式** — 开发环境内置模拟数据，无需后端即可预览完整 UI

## 技术栈

| 层级 | 技术选型 |
|------|----------|
| **前端** | React 18 + TypeScript + Vite + TailwindCSS |
| **后端** | Node.js + Express + MySQL 5.7 |
| **飞书集成** | JSSDK (免登) + @larksuiteoapi/node-sdk (消息卡片) |
| **部署** | Nginx 反向代理 + PM2 进程管理 |

## 项目结构

```
feishu-moments/
├── frontend/                   # React 前端
│   ├── src/
│   │   ├── api/                # 请求封装 & 类型定义 & Mock 数据
│   │   ├── components/         # 通用组件
│   │   │   ├── Avatar.tsx      # 头像（支持首字母占位）
│   │   │   ├── CreatePost.tsx  # 发帖弹窗
│   │   │   ├── ImageGrid.tsx   # 九宫格图片 + 全屏预览
│   │   │   └── PostCard.tsx    # 帖子卡片（点赞/评论/分享）
│   │   ├── pages/
│   │   │   ├── Feed.tsx        # 首页动态流
│   │   │   └── PostDetail.tsx  # 帖子详情 & 完整评论
│   │   ├── hooks/              # useAuth / usePosts
│   │   └── utils/              # 飞书 SDK 封装 / 时间格式化
│   ├── index.html
│   ├── vite.config.ts
│   └── tailwind.config.js
├── backend/                    # Node.js 后端
│   ├── src/
│   │   ├── config/             # 数据库 & 飞书 SDK 配置
│   │   ├── middleware/         # JWT 认证中间件
│   │   ├── routes/
│   │   │   ├── auth.js         # 飞书免登 → JWT
│   │   │   ├── posts.js        # 帖子 CRUD + Feed 分页
│   │   │   ├── likes.js        # 点赞/取消 (toggle)
│   │   │   ├── comments.js     # 评论/回复（树形结构）
│   │   │   ├── upload.js       # 图片上传 (multer)
│   │   │   └── share.js        # 转发 → 飞书消息卡片
│   │   └── index.js            # Express 入口
│   └── .env.example
├── sql/init.sql                # 数据库建表脚本
├── nginx.conf                  # Nginx 配置模板
└── deploy.sh                   # 一键部署脚本
```

## 快速开始

### 本地开发（Mock 模式）

无需后端和飞书配置，即可预览完整 UI：

```bash
cd frontend
npm install
npm run dev
```

打开 http://localhost:5173 即可看到带模拟数据的完整界面。

### 完整部署

#### 1. 飞书开放平台配置

1. 前往 [飞书开放平台](https://open.feishu.cn/) 创建「企业自建应用」
2. 开启「网页应用」能力，配置 H5 首页地址和可信域名
3. 开启「机器人」能力（用于消息卡片转发）
4. 申请权限：`im:message`、`contact:user.base:readonly`
5. 记录 `App ID` 和 `App Secret`

#### 2. 服务器配置

```bash
# 初始化数据库
mysql -u root -p < sql/init.sql

# 配置后端环境变量
cd backend
cp .env.example .env
# 编辑 .env 填入数据库密码、飞书 App ID/Secret、JWT 密钥等

# 安装依赖并启动
npm install
pm2 start src/index.js --name feishu-moments

# 配置前端环境变量
cd ../frontend
cp .env.example .env
# 编辑 .env 填入 VITE_FEISHU_APP_ID

# 构建前端
npm install
npm run build
```

#### 3. Nginx 配置

参考 `nginx.conf` 模板配置反向代理，确保：
- 前端静态文件由 Nginx 直接服务
- `/api/*` 请求代理到后端 3001 端口
- `/uploads/*` 指向上传文件目录
- 飞书 H5 应用要求 HTTPS

#### 4. 一键部署（可选）

```bash
# 从本地一键构建并部署到服务器
chmod +x deploy.sh
./deploy.sh
```

## API 文档

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | `/api/auth/login` | 飞书免登（code → JWT） | - |
| GET | `/api/posts` | 获取 Feed（分页） | JWT |
| POST | `/api/posts` | 发布动态 | JWT |
| GET | `/api/posts/:id` | 帖子详情 | JWT |
| DELETE | `/api/posts/:id` | 删除动态（仅作者） | JWT |
| POST | `/api/posts/:id/like` | 点赞/取消点赞 | JWT |
| GET | `/api/posts/:id/comments` | 获取评论列表（树形） | JWT |
| POST | `/api/posts/:id/comments` | 发表评论/回复 | JWT |
| POST | `/api/posts/:id/share` | 转发到群聊/私聊 | JWT |
| POST | `/api/upload` | 上传图片（最多 9 张） | JWT |

## 数据库 ER 关系

```
users (用户表)
  ├── posts (帖子表)      — user_id → users.id
  ├── likes (点赞表)      — user_id → users.id, post_id → posts.id
  └── comments (评论表)   — user_id → users.id, post_id → posts.id
                            parent_id → comments.id (自关联，回复)
```

## 路线图

- [x] Phase 1 — 核心功能（Feed / 发帖 / 点赞 / 评论）
- [x] Phase 2 — 分享转发（飞书消息卡片）
- [ ] Phase 3 — 消息通知（评论/点赞推送）
- [ ] Phase 4 — 链接预览（URL 自动变卡片）
- [ ] Phase 5 — 视频动态支持

## License

MIT
