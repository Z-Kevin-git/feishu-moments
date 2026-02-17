#!/bin/bash
# 飞书朋友圈 部署脚本
# 在本地执行，自动构建并部署到服务器

set -e

SERVER="root@YOUR_SERVER_IP"
REMOTE_DIR="/www/feishu-moments"

echo "=== 1. 构建前端 ==="
cd frontend
npm install
npm run build
cd ..

echo "=== 2. 同步文件到服务器 ==="
# 创建远程目录
ssh $SERVER "mkdir -p $REMOTE_DIR/{frontend/dist,backend,sql}"

# 同步前端构建产物
rsync -avz --delete frontend/dist/ $SERVER:$REMOTE_DIR/frontend/dist/

# 同步后端代码
rsync -avz --exclude node_modules --exclude uploads --exclude .env backend/ $SERVER:$REMOTE_DIR/backend/

# 同步 SQL 和 Nginx 配置
rsync -avz sql/ $SERVER:$REMOTE_DIR/sql/
rsync -avz nginx.conf $SERVER:$REMOTE_DIR/

echo "=== 3. 服务器端安装依赖并启动 ==="
ssh $SERVER << 'ENDSSH'
cd /www/feishu-moments/backend

# 安装依赖
npm install --production

# 创建上传目录
mkdir -p uploads

# 如果 .env 不存在，从示例文件创建
if [ ! -f .env ]; then
  cp .env.example .env
  echo "请编辑 /www/feishu-moments/backend/.env 配置文件！"
fi

# 使用 pm2 管理进程（如果已安装）
if command -v pm2 &> /dev/null; then
  pm2 stop feishu-moments 2>/dev/null || true
  pm2 start src/index.js --name feishu-moments
  pm2 save
else
  echo "建议安装 pm2 来管理进程: npm install -g pm2"
  echo "手动启动: cd /www/feishu-moments/backend && node src/index.js"
fi

echo "=== 部署完成 ==="
ENDSSH

echo ""
echo "部署完成！接下来需要："
echo "1. 编辑服务器上的 /www/feishu-moments/backend/.env（配置数据库和飞书应用信息）"
echo "2. 在服务器上执行 SQL 初始化: mysql < /www/feishu-moments/sql/init.sql"
echo "3. 配置 Nginx 并重启"
echo "4. 在飞书开放平台配置应用的 H5 地址和可信域名"
