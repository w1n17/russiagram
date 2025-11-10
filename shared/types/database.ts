export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
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
        };
        Insert: {
          id: string;
          username: string;
          full_name?: string | null;
          bio?: string | null;
          avatar_url?: string | null;
          website?: string | null;
          is_verified?: boolean;
          is_private?: boolean;
          followers_count?: number;
          following_count?: number;
          posts_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          full_name?: string | null;
          bio?: string | null;
          avatar_url?: string | null;
          website?: string | null;
          is_verified?: boolean;
          is_private?: boolean;
          followers_count?: number;
          following_count?: number;
          posts_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      posts: {
        Row: {
          id: string;
          user_id: string;
          caption: string | null;
          media_urls: string[];
          media_type: 'image' | 'video' | 'carousel';
          location: string | null;
          likes_count: number;
          comments_count: number;
          shares_count: number;
          is_hidden: boolean;
          allow_comments: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          caption?: string | null;
          media_urls: string[];
          media_type: 'image' | 'video' | 'carousel';
          location?: string | null;
          likes_count?: number;
          comments_count?: number;
          shares_count?: number;
          is_hidden?: boolean;
          allow_comments?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          caption?: string | null;
          media_urls?: string[];
          media_type?: 'image' | 'video' | 'carousel';
          location?: string | null;
          likes_count?: number;
          comments_count?: number;
          shares_count?: number;
          is_hidden?: boolean;
          allow_comments?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      reels: {
        Row: {
          id: string;
          user_id: string;
          video_url: string;
          thumbnail_url: string | null;
          caption: string | null;
          audio_name: string | null;
          likes_count: number;
          comments_count: number;
          views_count: number;
          shares_count: number;
          duration: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          video_url: string;
          thumbnail_url?: string | null;
          caption?: string | null;
          audio_name?: string | null;
          likes_count?: number;
          comments_count?: number;
          views_count?: number;
          shares_count?: number;
          duration: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          video_url?: string;
          thumbnail_url?: string | null;
          caption?: string | null;
          audio_name?: string | null;
          likes_count?: number;
          comments_count?: number;
          views_count?: number;
          shares_count?: number;
          duration?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      stories: {
        Row: {
          id: string;
          user_id: string;
          media_url: string;
          media_type: 'image' | 'video';
          duration: number;
          views_count: number;
          expires_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          media_url: string;
          media_type: 'image' | 'video';
          duration?: number;
          views_count?: number;
          expires_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          media_url?: string;
          media_type?: 'image' | 'video';
          duration?: number;
          views_count?: number;
          expires_at?: string;
          created_at?: string;
        };
      };
      comments: {
        Row: {
          id: string;
          user_id: string;
          post_id: string | null;
          reel_id: string | null;
          parent_comment_id: string | null;
          content: string;
          likes_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          post_id?: string | null;
          reel_id?: string | null;
          parent_comment_id?: string | null;
          content: string;
          likes_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          post_id?: string | null;
          reel_id?: string | null;
          parent_comment_id?: string | null;
          content?: string;
          likes_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      likes: {
        Row: {
          id: string;
          user_id: string;
          post_id: string | null;
          reel_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          post_id?: string | null;
          reel_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          post_id?: string | null;
          reel_id?: string | null;
          created_at?: string;
        };
      };
      follows: {
        Row: {
          id: string;
          follower_id: string;
          following_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          follower_id: string;
          following_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          follower_id?: string;
          following_id?: string;
          created_at?: string;
        };
      };
      conversations: {
        Row: {
          id: string;
          is_group: boolean;
          name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          is_group?: boolean;
          name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          is_group?: boolean;
          name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          sender_id: string;
          content: string | null;
          media_url: string | null;
          media_type: 'image' | 'video' | 'audio' | 'post' | 'reel' | null;
          post_id: string | null;
          reel_id: string | null;
          is_read: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          sender_id: string;
          content?: string | null;
          media_url?: string | null;
          media_type?: 'image' | 'video' | 'audio' | 'post' | 'reel' | null;
          post_id?: string | null;
          reel_id?: string | null;
          is_read?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          conversation_id?: string;
          sender_id?: string;
          content?: string | null;
          media_url?: string | null;
          media_type?: 'image' | 'video' | 'audio' | 'post' | 'reel' | null;
          post_id?: string | null;
          reel_id?: string | null;
          is_read?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}
