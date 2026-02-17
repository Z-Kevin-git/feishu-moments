import type { Post, Comment, User } from './types';

export const mockUsers: User[] = [
  { id: 1, open_id: 'u1', name: '张明远', avatar_url: '' },
  { id: 2, open_id: 'u2', name: '李思琪', avatar_url: '' },
  { id: 3, open_id: 'u3', name: '王浩然', avatar_url: '' },
  { id: 4, open_id: 'u4', name: '陈雨薇', avatar_url: '' },
  { id: 5, open_id: 'u5', name: '赵文博', avatar_url: '' },
  { id: 6, open_id: 'u6', name: '刘晓晨', avatar_url: '' },
];

// 使用 picsum 随机图片
const img = (id: number, w = 400, h = 400) =>
  `https://picsum.photos/seed/${id}/${w}/${h}`;

const now = Date.now();
const hour = 3600 * 1000;
const day = 24 * hour;

export const mockPosts: Post[] = [
  {
    id: 1,
    user_id: 2,
    content: '今天团队一起去了公司附近新开的咖啡馆，环境超棒！推荐大家午休的时候去坐坐，拿铁和提拉米苏绝了',
    images: [img(101), img(102), img(103)],
    like_count: 12,
    comment_count: 3,
    is_liked: true,
    author_name: '李思琪',
    author_avatar: '',
    created_at: new Date(now - 2 * hour).toISOString(),
    recent_comments: [
      {
        id: 1, post_id: 1, user_id: 3, parent_id: null, reply_to_user_id: null,
        content: '看起来好棒！叫什么名字？', author_name: '王浩然', author_avatar: '',
        created_at: new Date(now - 1.5 * hour).toISOString(),
      },
      {
        id: 2, post_id: 1, user_id: 2, parent_id: 1, reply_to_user_id: 3,
        reply_to_name: '王浩然',
        content: '叫「半日闲」，在B座一楼', author_name: '李思琪', author_avatar: '',
        created_at: new Date(now - 1 * hour).toISOString(),
      },
    ],
  },
  {
    id: 2,
    user_id: 1,
    content: '分享一下我们Q1的产品路线图讨论成果，大家有任何想法欢迎在下面留言交流！\n\n重点方向：\n1. 用户增长体系优化\n2. 数据看板升级\n3. 移动端体验改进',
    images: [],
    like_count: 28,
    comment_count: 7,
    is_liked: false,
    author_name: '张明远',
    author_avatar: '',
    created_at: new Date(now - 5 * hour).toISOString(),
    recent_comments: [
      {
        id: 3, post_id: 2, user_id: 5, parent_id: null, reply_to_user_id: null,
        content: '数据看板期待已久了！希望能加上自定义维度筛选', author_name: '赵文博', author_avatar: '',
        created_at: new Date(now - 4 * hour).toISOString(),
      },
      {
        id: 4, post_id: 2, user_id: 4, parent_id: null, reply_to_user_id: null,
        content: '移动端确实需要改进，现在加载速度有点慢', author_name: '陈雨薇', author_avatar: '',
        created_at: new Date(now - 3 * hour).toISOString(),
      },
    ],
  },
  {
    id: 3,
    user_id: 4,
    content: '周末去爬了灵隐寺后面的北高峰，天气太好了！山顶可以看到整个西湖',
    images: [img(201, 400, 300), img(202, 400, 300), img(203, 400, 300), img(204, 400, 300)],
    like_count: 45,
    comment_count: 8,
    is_liked: true,
    author_name: '陈雨薇',
    author_avatar: '',
    created_at: new Date(now - 1 * day).toISOString(),
    recent_comments: [
      {
        id: 5, post_id: 3, user_id: 6, parent_id: null, reply_to_user_id: null,
        content: '风景绝了！下次组团去', author_name: '刘晓晨', author_avatar: '',
        created_at: new Date(now - 20 * hour).toISOString(),
      },
    ],
  },
  {
    id: 4,
    user_id: 3,
    content: '新人报到！我是技术部的王浩然，主要负责后端开发。之前在字节跳动做推荐系统，很高兴加入大家，希望多多交流！',
    images: [img(301)],
    like_count: 56,
    comment_count: 12,
    is_liked: false,
    author_name: '王浩然',
    author_avatar: '',
    created_at: new Date(now - 2 * day).toISOString(),
    recent_comments: [
      {
        id: 6, post_id: 4, user_id: 1, parent_id: null, reply_to_user_id: null,
        content: '欢迎欢迎！有推荐系统经验太好了', author_name: '张明远', author_avatar: '',
        created_at: new Date(now - 1.8 * day).toISOString(),
      },
      {
        id: 7, post_id: 4, user_id: 2, parent_id: null, reply_to_user_id: null,
        content: '欢迎加入！有空一起喝咖啡', author_name: '李思琪', author_avatar: '',
        created_at: new Date(now - 1.5 * day).toISOString(),
      },
    ],
  },
  {
    id: 5,
    user_id: 5,
    content: '给大家推荐一本书《思考，快与慢》，最近重读了一遍，对产品决策和用户行为分析很有启发。特别是关于系统1和系统2的思维模式，可以直接应用到我们的交互设计中。',
    images: [],
    like_count: 33,
    comment_count: 5,
    is_liked: true,
    author_name: '赵文博',
    author_avatar: '',
    created_at: new Date(now - 3 * day).toISOString(),
    recent_comments: [
      {
        id: 8, post_id: 5, user_id: 4, parent_id: null, reply_to_user_id: null,
        content: '经典之作！Daniel Kahneman 是诺贝尔奖得主', author_name: '陈雨薇', author_avatar: '',
        created_at: new Date(now - 2.5 * day).toISOString(),
      },
    ],
  },
  {
    id: 6,
    user_id: 6,
    content: '设计团队的新办公区布置好了！感谢行政小伙伴帮忙，终于有了独立的头脑风暴区域',
    images: [img(401), img(402), img(403), img(404), img(405), img(406)],
    like_count: 67,
    comment_count: 15,
    is_liked: false,
    author_name: '刘晓晨',
    author_avatar: '',
    created_at: new Date(now - 4 * day).toISOString(),
    recent_comments: [
      {
        id: 9, post_id: 6, user_id: 1, parent_id: null, reply_to_user_id: null,
        content: '太羡慕了！我们也想要！', author_name: '张明远', author_avatar: '',
        created_at: new Date(now - 3.8 * day).toISOString(),
      },
      {
        id: 10, post_id: 6, user_id: 3, parent_id: null, reply_to_user_id: null,
        content: '什么时候可以来参观一下', author_name: '王浩然', author_avatar: '',
        created_at: new Date(now - 3.5 * day).toISOString(),
      },
    ],
  },
  {
    id: 7,
    user_id: 1,
    content: '公司年会定在下月15号，今年的主题是「无限可能」。有想表演节目的同学请在本周五之前报名，目前已经有3个乐队和2个脱口秀选手了！',
    images: [img(501, 600, 300)],
    like_count: 89,
    comment_count: 23,
    is_liked: true,
    author_name: '张明远',
    author_avatar: '',
    created_at: new Date(now - 5 * day).toISOString(),
    recent_comments: [
      {
        id: 11, post_id: 7, user_id: 6, parent_id: null, reply_to_user_id: null,
        content: '我报名舞蹈！需要几个人一起', author_name: '刘晓晨', author_avatar: '',
        created_at: new Date(now - 4.5 * day).toISOString(),
      },
      {
        id: 12, post_id: 7, user_id: 5, parent_id: null, reply_to_user_id: null,
        content: '脱口秀还能报名吗？', author_name: '赵文博', author_avatar: '',
        created_at: new Date(now - 4 * day).toISOString(),
      },
    ],
  },
];

// 帖子详情的完整评论（带回复）
export const mockCommentsMap: Record<number, (Comment & { replies: Comment[] })[]> = {
  1: [
    {
      id: 1, post_id: 1, user_id: 3, parent_id: null, reply_to_user_id: null,
      content: '看起来好棒！叫什么名字？', author_name: '王浩然', author_avatar: '',
      created_at: new Date(now - 1.5 * hour).toISOString(),
      replies: [
        {
          id: 2, post_id: 1, user_id: 2, parent_id: 1, reply_to_user_id: 3,
          reply_to_name: '王浩然',
          content: '叫「半日闲」，在B座一楼', author_name: '李思琪', author_avatar: '',
          created_at: new Date(now - 1 * hour).toISOString(),
        },
      ],
    },
    {
      id: 13, post_id: 1, user_id: 5, parent_id: null, reply_to_user_id: null,
      content: '提拉米苏多少钱一份？', author_name: '赵文博', author_avatar: '',
      created_at: new Date(now - 0.5 * hour).toISOString(),
      replies: [],
    },
  ],
};

// Mock 数据存储
let postsData = [...mockPosts];
let nextPostId = 100;
let nextCommentId = 100;

export const mockApi = {
  login: (): { token: string; user: User } => ({
    token: 'mock_token',
    user: mockUsers[0],
  }),

  getPosts: (page: number, limit: number): { posts: Post[]; page: number; limit: number } => {
    const start = (page - 1) * limit;
    const end = start + limit;
    return { posts: postsData.slice(start, end), page, limit };
  },

  getPost: (id: number): Post | null => {
    return postsData.find((p) => p.id === id) || null;
  },

  createPost: (content: string, images: string[], user: User): Post => {
    const post: Post = {
      id: nextPostId++,
      user_id: user.id,
      content,
      images,
      like_count: 0,
      comment_count: 0,
      is_liked: false,
      author_name: user.name,
      author_avatar: user.avatar_url,
      created_at: new Date().toISOString(),
      recent_comments: [],
    };
    postsData = [post, ...postsData];
    return post;
  },

  toggleLike: (postId: number): { liked: boolean; like_count: number } => {
    const post = postsData.find((p) => p.id === postId);
    if (!post) return { liked: false, like_count: 0 };

    post.is_liked = !post.is_liked;
    post.like_count += post.is_liked ? 1 : -1;
    return { liked: post.is_liked, like_count: post.like_count };
  },

  getComments: (postId: number): (Comment & { replies: Comment[] })[] => {
    return mockCommentsMap[postId] || [];
  },

  addComment: (
    postId: number,
    content: string,
    user: User,
    parentId?: number,
    replyToUserId?: number,
    replyToName?: string
  ): Comment => {
    const comment: Comment = {
      id: nextCommentId++,
      post_id: postId,
      user_id: user.id,
      parent_id: parentId || null,
      reply_to_user_id: replyToUserId || null,
      reply_to_name: replyToName,
      content,
      author_name: user.name,
      author_avatar: user.avatar_url,
      created_at: new Date().toISOString(),
    };

    // 更新帖子评论数
    const post = postsData.find((p) => p.id === postId);
    if (post) post.comment_count += 1;

    // 更新评论 map
    if (!mockCommentsMap[postId]) mockCommentsMap[postId] = [];
    if (parentId) {
      const parent = mockCommentsMap[postId].find((c) => c.id === parentId);
      if (parent) parent.replies.push(comment);
    } else {
      mockCommentsMap[postId].push({ ...comment, replies: [] });
    }

    return comment;
  },

  deletePost: (postId: number): boolean => {
    const idx = postsData.findIndex((p) => p.id === postId);
    if (idx === -1) return false;
    postsData.splice(idx, 1);
    return true;
  },
};
