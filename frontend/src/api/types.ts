export interface User {
  id: number;
  open_id: string;
  name: string;
  avatar_url: string;
}

export interface Post {
  id: number;
  user_id: number;
  content: string;
  images: string[];
  like_count: number;
  comment_count: number;
  is_liked: boolean;
  author_name: string;
  author_avatar: string;
  created_at: string;
  recent_comments?: Comment[];
  like_users?: User[];
}

export interface Comment {
  id: number;
  post_id: number;
  user_id: number;
  parent_id: number | null;
  reply_to_user_id: number | null;
  reply_to_name?: string;
  content: string;
  author_name: string;
  author_avatar: string;
  created_at: string;
  replies?: Comment[];
}

export interface FeedResponse {
  posts: Post[];
  page: number;
  limit: number;
}

export interface LoginResponse {
  token: string;
  user: User;
}
