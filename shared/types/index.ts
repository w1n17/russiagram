export interface Profile {
  id: string;
  username: string;
  full_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  website: string | null;
  is_verified: boolean;
  is_private: boolean;
  followers_count: number;
  following_count: number;
  posts_count: number;
  created_at: string;
  updated_at: string;
}

export interface Post {
  id: string;
  user_id: string;
  user?: Profile;
  caption: string | null;
  media_urls: string[];
  media_type: 'image' | 'video' | 'carousel';
  location: string | null;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  is_hidden: boolean;
  allow_comments: boolean;
  is_liked?: boolean;
  is_saved?: boolean;
  created_at: string;
  updated_at: string;
}

export interface Reel {
  id: string;
  user_id: string;
  user?: Profile;
  video_url: string;
  thumbnail_url: string | null;
  caption: string | null;
  audio_name: string | null;
  likes_count: number;
  comments_count: number;
  views_count: number;
  shares_count: number;
  duration: number;
  is_liked?: boolean;
  created_at: string;
  updated_at: string;
}

export interface Story {
  id: string;
  user_id: string;
  user?: Profile;
  media_url: string;
  media_type: 'image' | 'video';
  duration: number;
  views_count: number;
  is_viewed?: boolean;
  expires_at: string;
  created_at: string;
}

export interface Comment {
  id: string;
  user_id: string;
  user?: Profile;
  post_id: string | null;
  reel_id: string | null;
  parent_comment_id: string | null;
  content: string;
  likes_count: number;
  is_liked?: boolean;
  replies?: Comment[];
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender?: Profile;
  content: string | null;
  media_url: string | null;
  media_type: 'image' | 'video' | 'audio' | 'post' | 'reel' | null;
  post_id: string | null;
  reel_id: string | null;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: string;
  is_group: boolean;
  name: string | null;
  avatar_url: string | null;
  participants?: Profile[];
  last_message?: Message;
  unread_count?: number;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  actor_id: string | null;
  actor?: Profile;
  type: 'like' | 'comment' | 'follow' | 'mention' | 'message';
  post_id: string | null;
  reel_id: string | null;
  comment_id: string | null;
  is_read: boolean;
  created_at: string;
}
