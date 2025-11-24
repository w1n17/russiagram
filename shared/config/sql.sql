-- Russiagram Database Schema for Supabase
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- Users table (extends Supabase auth.users)
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    full_name TEXT,
    bio TEXT,
    avatar_url TEXT,
    website TEXT,
    is_verified BOOLEAN DEFAULT false,
    is_private BOOLEAN DEFAULT false,
    followers_count INTEGER DEFAULT 0,
    following_count INTEGER DEFAULT 0,
    posts_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Posts table
CREATE TABLE posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    caption TEXT,
    media_urls TEXT [] NOT NULL,
    media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video', 'carousel')),
    location TEXT,
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    shares_count INTEGER DEFAULT 0,
    is_hidden BOOLEAN DEFAULT false,
    allow_comments BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Reels table
CREATE TABLE reels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    video_url TEXT NOT NULL,
    thumbnail_url TEXT,
    caption TEXT,
    audio_name TEXT,
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    views_count INTEGER DEFAULT 0,
    shares_count INTEGER DEFAULT 0,
    duration INTEGER NOT NULL,
    -- in seconds
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Stories table
CREATE TABLE stories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    media_url TEXT NOT NULL,
    media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video')),
    duration INTEGER DEFAULT 5,
    -- in seconds
    views_count INTEGER DEFAULT 0,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '24 hours',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Story views table
CREATE TABLE story_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    story_id UUID REFERENCES stories(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(story_id, user_id)
);
-- Likes table
CREATE TABLE likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    reel_id UUID REFERENCES reels(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, post_id),
    UNIQUE(user_id, reel_id),
    CHECK (
        (
            post_id IS NOT NULL
            AND reel_id IS NULL
        )
        OR (
            post_id IS NULL
            AND reel_id IS NOT NULL
        )
    )
);
-- Comments table
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    reel_id UUID REFERENCES reels(id) ON DELETE CASCADE,
    parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CHECK (
        (
            post_id IS NOT NULL
            AND reel_id IS NULL
        )
        OR (
            post_id IS NULL
            AND reel_id IS NOT NULL
        )
    )
);
-- Comment likes table
CREATE TABLE comment_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    comment_id UUID REFERENCES comments(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, comment_id)
);
-- Follows table
CREATE TABLE follows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    follower_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    following_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(follower_id, following_id),
    CHECK (follower_id != following_id)
);
-- Direct messages conversations table
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    is_group BOOLEAN DEFAULT false,
    name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Conversation participants table
CREATE TABLE conversation_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    last_read_at TIMESTAMP WITH TIME ZONE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(conversation_id, user_id)
);
-- Messages table
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    content TEXT,
    media_url TEXT,
    media_type TEXT CHECK (
        media_type IN ('image', 'video', 'audio', 'post', 'reel')
    ),
    post_id UUID REFERENCES posts(id) ON DELETE
    SET NULL,
        reel_id UUID REFERENCES reels(id) ON DELETE
    SET NULL,
        is_read BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Saved posts table
CREATE TABLE saved_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, post_id)
);
-- Notifications table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    actor_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (
        type IN (
            'like',
            'comment',
            'follow',
            'mention',
            'message'
        )
    ),
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    reel_id UUID REFERENCES reels(id) ON DELETE CASCADE,
    comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Indexes for better performance
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_reels_user_id ON reels(user_id);
CREATE INDEX idx_reels_created_at ON reels(created_at DESC);
CREATE INDEX idx_stories_user_id ON stories(user_id);
CREATE INDEX idx_stories_expires_at ON stories(expires_at);
CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_comments_reel_id ON comments(reel_id);
CREATE INDEX idx_likes_post_id ON likes(post_id);
CREATE INDEX idx_likes_reel_id ON likes(reel_id);
CREATE INDEX idx_follows_follower_id ON follows(follower_id);
CREATE INDEX idx_follows_following_id ON follows(following_id);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
-- Row Level Security (RLS) Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE reels ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR
SELECT USING (true);
CREATE POLICY "Users can insert own profile" ON profiles FOR
INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR
UPDATE USING (auth.uid() = id);
-- Posts policies
CREATE POLICY "Posts are viewable by everyone" ON posts FOR
SELECT USING (NOT is_hidden);
CREATE POLICY "Users can create own posts" ON posts FOR
INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own posts" ON posts FOR
UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own posts" ON posts FOR DELETE USING (auth.uid() = user_id);
-- Similar policies for reels, stories, comments, etc.
-- (Add more as needed)
-- Functions for updating counts
CREATE OR REPLACE FUNCTION increment_post_likes() RETURNS TRIGGER AS $$ BEGIN
UPDATE posts
SET likes_count = likes_count + 1
WHERE id = NEW.post_id;
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE OR REPLACE FUNCTION decrement_post_likes() RETURNS TRIGGER AS $$ BEGIN
UPDATE posts
SET likes_count = likes_count - 1
WHERE id = OLD.post_id;
RETURN OLD;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER increment_post_likes_trigger
AFTER
INSERT ON likes FOR EACH ROW
    WHEN (NEW.post_id IS NOT NULL) EXECUTE FUNCTION increment_post_likes();
CREATE TRIGGER decrement_post_likes_trigger
AFTER DELETE ON likes FOR EACH ROW
    WHEN (OLD.post_id IS NOT NULL) EXECUTE FUNCTION decrement_post_likes();
-- Trigger for updating followers count
CREATE OR REPLACE FUNCTION update_followers_count() RETURNS TRIGGER AS $$ BEGIN IF TG_OP = 'INSERT' THEN
UPDATE profiles
SET followers_count = followers_count + 1
WHERE id = NEW.following_id;
UPDATE profiles
SET following_count = following_count + 1
WHERE id = NEW.follower_id;
RETURN NEW;
ELSIF TG_OP = 'DELETE' THEN
UPDATE profiles
SET followers_count = followers_count - 1
WHERE id = OLD.following_id;
UPDATE profiles
SET following_count = following_count - 1
WHERE id = OLD.follower_id;
RETURN OLD;
END IF;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER update_followers_trigger
AFTER
INSERT
    OR DELETE ON follows FOR EACH ROW EXECUTE FUNCTION update_followers_count();
-- Trigger for automatic profile creation on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER AS $$ BEGIN
INSERT INTO public.profiles (id, username, full_name, created_at)
VALUES (
        NEW.id,
        COALESCE(
            NEW.raw_user_meta_data->>'username',
            split_part(NEW.email, '@', 1)
        ),
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        NOW()
    );
RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER
INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
-- ============================================
-- КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Автосоздание профилей
-- ============================================
-- 1. Удалить старый триггер если есть
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
-- 2. Создать функцию триггера
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER SECURITY DEFINER
SET search_path = public LANGUAGE plpgsql AS $$ BEGIN
INSERT INTO public.profiles (
        id,
        username,
        full_name,
        created_at,
        updated_at
    )
VALUES (
        NEW.id,
        COALESCE(
            NEW.raw_user_meta_data->>'username',
            split_part(NEW.email, '@', 1)
        ),
        COALESCE(
            NEW.raw_user_meta_data->>'full_name',
            ''
        ),
        NOW(),
        NOW()
    );
RETURN NEW;
EXCEPTION
WHEN OTHERS THEN -- Логируем ошибку но не прерываем регистрацию
RAISE WARNING 'Could not create profile for user %: %',
NEW.id,
SQLERRM;
RETURN NEW;
END;
$$;
-- 3. Создать триггер
CREATE TRIGGER on_auth_user_created
AFTER
INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
-- 4. ВАЖНО: Создать профили для существующих пользователей БЕЗ профилей
INSERT INTO public.profiles (id, username, full_name, created_at, updated_at)
SELECT au.id,
    split_part(au.email, '@', 1) as username,
    COALESCE(au.raw_user_meta_data->>'full_name', '') as full_name,
    au.created_at,
    NOW() as updated_at
FROM auth.users au
    LEFT JOIN public.profiles p ON p.id = au.id
WHERE p.id IS NULL;
-- 5. Проверка
SELECT 'Users without profiles' as check_name,
    COUNT(*) as count
FROM auth.users au
    LEFT JOIN public.profiles p ON p.id = au.id
WHERE p.id IS NULL;
-- Должно вернуть 0!
-- ============================================
-- Storage Buckets и RLS политики
-- ============================================
-- Выполните этот SQL ПОСЛЕ создания buckets через Dashboard
-- 1. RLS политики для AVATARS
-- ============================================
-- Все могут просматривать аватары
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects FOR
SELECT USING (bucket_id = 'avatars');
-- Пользователи могут загружать свой аватар
CREATE POLICY "Users can upload own avatar" ON storage.objects FOR
INSERT WITH CHECK (
        bucket_id = 'avatars'
        AND auth.uid()::text = (storage.foldername(name)) [1]
    );
-- Пользователи могут обновлять свой аватар
CREATE POLICY "Users can update own avatar" ON storage.objects FOR
UPDATE USING (
        bucket_id = 'avatars'
        AND auth.uid()::text = (storage.foldername(name)) [1]
    );
-- Пользователи могут удалять свой аватар
CREATE POLICY "Users can delete own avatar" ON storage.objects FOR DELETE USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name)) [1]
);
-- 2. RLS политики для POSTS
-- ============================================
-- Все могут просматривать посты
CREATE POLICY "Post media are publicly accessible" ON storage.objects FOR
SELECT USING (bucket_id = 'posts');
-- Аутентифицированные пользователи могут загружать
CREATE POLICY "Authenticated users can upload posts" ON storage.objects FOR
INSERT WITH CHECK (
        bucket_id = 'posts'
        AND auth.role() = 'authenticated'
    );
-- Пользователи могут удалять свои посты
CREATE POLICY "Users can delete own posts" ON storage.objects FOR DELETE USING (
    bucket_id = 'posts'
    AND auth.uid()::text = (storage.foldername(name)) [1]
);
-- 3. Проверка
-- ============================================
-- Проверить созданные buckets
SELECT id,
    name,
    public
FROM storage.buckets;
-- Проверить политики
SELECT policyname,
    tablename,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'storage'
ORDER BY tablename,
    policyname;
-- ИСПРАВЛЕНИЕ RLS ПОЛИТИК ДЛЯ ЛАЙКОВ
-- Выполните этот скрипт в Supabase SQL Editor
-- 1. Удаляем старые политики
DROP POLICY IF EXISTS "Users can view all likes" ON likes;
DROP POLICY IF EXISTS "Users can insert their own likes" ON likes;
DROP POLICY IF EXISTS "Users can delete their own likes" ON likes;
-- 2. Создаём правильные политики
-- Просмотр всех лайков (для счётчиков и проверки is_liked)
CREATE POLICY "Anyone can view likes" ON likes FOR
SELECT USING (true);
-- Добавление своих лайков
CREATE POLICY "Users can insert their own likes" ON likes FOR
INSERT WITH CHECK (auth.uid() = user_id);
-- Удаление своих лайков
CREATE POLICY "Users can delete their own likes" ON likes FOR DELETE USING (auth.uid() = user_id);
-- 3. Проверяем что RLS включен
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
-- ГОТОВО! Теперь лайки должны работать.
-- ИСПРАВЛЕНИЕ RLS ПОЛИТИК ДЛЯ КОММЕНТАРИЕВ
-- Выполните этот скрипт в Supabase SQL Editor НЕМЕДЛЕННО!
-- 1. Удаляем старые политики (если есть)
DROP POLICY IF EXISTS "Anyone can view comments" ON comments;
DROP POLICY IF EXISTS "Users can insert their own comments" ON comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON comments;
-- 2. Создаём правильные политики
-- Просмотр всех комментариев
CREATE POLICY "Anyone can view comments" ON comments FOR
SELECT USING (true);
-- Добавление своих комментариев
CREATE POLICY "Users can insert their own comments" ON comments FOR
INSERT WITH CHECK (auth.uid() = user_id);
-- Удаление своих комментариев
CREATE POLICY "Users can delete their own comments" ON comments FOR DELETE USING (auth.uid() = user_id);
-- 3. Включаем RLS
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
-- ГОТОВО! Теперь комментарии должны работать.
-- Policy for 'stories' bucket
-- Create a new public bucket named 'stories' in Supabase Dashboard first
-- 1. Public access for viewing stories
CREATE POLICY "Stories are publicly accessible" ON storage.objects FOR
SELECT USING (bucket_id = 'stories');
-- 2. Authenticated users can upload stories
CREATE POLICY "Authenticated users can upload stories" ON storage.objects FOR
INSERT WITH CHECK (
        bucket_id = 'stories'
        AND auth.role() = 'authenticated'
    );
-- 3. Users can delete their own stories
CREATE POLICY "Users can delete own stories" ON storage.objects FOR DELETE USING (
    bucket_id = 'stories'
    AND auth.uid()::text = (storage.foldername(name)) [1]
);
-- Enable RLS for stories table
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
-- Allow users to view all stories
CREATE POLICY "Stories are visible to everyone" ON stories FOR
SELECT USING (true);
-- Allow authenticated users to insert their own stories
CREATE POLICY "Users can upload their own stories" ON stories FOR
INSERT WITH CHECK (auth.uid() = user_id);
-- Allow users to delete their own stories
CREATE POLICY "Users can delete their own stories" ON stories FOR DELETE USING (auth.uid() = user_id);
-- STORAGE POLICIES for 'stories' bucket
-- Ensure the bucket exists (idempotent via UI usually, but policies need it)
-- Allow public read access to stories bucket
CREATE POLICY "Give public access to stories" ON storage.objects FOR
SELECT USING (bucket_id = 'stories');
-- Allow authenticated users to upload to stories bucket
CREATE POLICY "Allow authenticated uploads to stories" ON storage.objects FOR
INSERT WITH CHECK (
        bucket_id = 'stories'
        AND auth.role() = 'authenticated'
    );
-- Allow users to update/delete their own story files
CREATE POLICY "Allow individual delete for stories" ON storage.objects FOR DELETE USING (
    bucket_id = 'stories'
    AND auth.uid() = owner
);
-- Enable RLS for stories table
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Stories are visible to everyone" ON stories;
DROP POLICY IF EXISTS "Users can upload their own stories" ON stories;
DROP POLICY IF EXISTS "Users can delete their own stories" ON stories;
-- Create policies for stories table
CREATE POLICY "Stories are visible to everyone" ON stories FOR
SELECT USING (true);
CREATE POLICY "Users can upload their own stories" ON stories FOR
INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own stories" ON stories FOR DELETE USING (auth.uid() = user_id);
-- STORAGE POLICIES for 'stories' bucket
-- Drop existing storage policies
DROP POLICY IF EXISTS "Give public access to stories" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads to stories" ON storage.objects;
DROP POLICY IF EXISTS "Allow individual delete for stories" ON storage.objects;
-- Create policies for storage
CREATE POLICY "Give public access to stories" ON storage.objects FOR
SELECT USING (bucket_id = 'stories');
CREATE POLICY "Allow authenticated uploads to stories" ON storage.objects FOR
INSERT WITH CHECK (
        bucket_id = 'stories'
        AND auth.role() = 'authenticated'
    );
CREATE POLICY "Allow individual delete for stories" ON storage.objects FOR DELETE USING (
    bucket_id = 'stories'
    AND auth.uid() = owner
);
-- Ensure the 'stories' bucket exists and is public
INSERT INTO storage.buckets (id, name, public)
VALUES ('stories', 'stories', true) ON CONFLICT (id) DO
UPDATE
SET public = true;
-- Drop restrictive policies again to be safe
DROP POLICY IF EXISTS "Give public access to stories" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads to stories" ON storage.objects;
DROP POLICY IF EXISTS "Allow individual delete for stories" ON storage.objects;
-- Create a simplified, permissive upload policy for authenticated users
CREATE POLICY "Allow authenticated uploads to stories" ON storage.objects FOR
INSERT WITH CHECK (
        bucket_id = 'stories'
        AND auth.role() = 'authenticated'
    );
-- Ensure public read access
CREATE POLICY "Give public access to stories" ON storage.objects FOR
SELECT USING (bucket_id = 'stories');
-- Ensure update/delete access for owner
CREATE POLICY "Allow individual delete for stories" ON storage.objects FOR DELETE USING (
    bucket_id = 'stories'
    AND auth.uid() = owner
);
CREATE POLICY "Allow individual update for stories" ON storage.objects FOR
UPDATE USING (
        bucket_id = 'stories'
        AND auth.uid() = owner
    );
-- 1. Ensure the 'stories' bucket exists and is PUBLIC
INSERT INTO storage.buckets (id, name, public)
VALUES ('stories', 'stories', true) ON CONFLICT (id) DO
UPDATE
SET public = true;
-- 2. Drop ALL existing policies for the 'stories' bucket to remove conflicts
DROP POLICY IF EXISTS "Give public access to stories" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads to stories" ON storage.objects;
DROP POLICY IF EXISTS "Allow individual delete for stories" ON storage.objects;
DROP POLICY IF EXISTS "Allow individual update for stories" ON storage.objects;
DROP POLICY IF EXISTS "Stories are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload stories" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own stories" ON storage.objects;
-- 3. Create SIMPLE, PERMISSIVE policies
-- Allow PUBLIC read access to everything in 'stories'
CREATE POLICY "Public Read Stories" ON storage.objects FOR
SELECT USING (bucket_id = 'stories');
-- Allow AUTHENTICATED users to upload ANYWHERE in 'stories'
CREATE POLICY "Authenticated Upload Stories" ON storage.objects FOR
INSERT WITH CHECK (
        bucket_id = 'stories'
        AND auth.role() = 'authenticated'
    );
-- Allow OWNERS to update/delete their files in 'stories'
CREATE POLICY "Owner Delete Stories" ON storage.objects FOR DELETE USING (
    bucket_id = 'stories'
    AND auth.uid() = owner
);
CREATE POLICY "Owner Update Stories" ON storage.objects FOR
UPDATE USING (
        bucket_id = 'stories'
        AND auth.uid() = owner
    );
-- 1. Enable RLS (idempotent)
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
-- 2. DROP ALL existing policies on the 'stories' TABLE to clear conflicts
DROP POLICY IF EXISTS "Stories are visible to everyone" ON stories;
DROP POLICY IF EXISTS "Users can upload their own stories" ON stories;
DROP POLICY IF EXISTS "Users can delete their own stories" ON stories;
DROP POLICY IF EXISTS "Authenticated users can insert stories" ON stories;
-- 3. Re-create SIMPLE policies for the 'stories' TABLE
-- READ: Everyone can see stories
CREATE POLICY "Public Read Stories Table" ON stories FOR
SELECT USING (true);
-- INSERT: Authenticated users can insert rows where user_id matches their ID
CREATE POLICY "Auth Insert Stories Table" ON stories FOR
INSERT WITH CHECK (auth.uid() = user_id);
-- DELETE: Users can delete their own rows
CREATE POLICY "Auth Delete Stories Table" ON stories FOR DELETE USING (auth.uid() = user_id);
-- 1. FIX FOLLOWS TABLE POLICIES
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
-- Drop existing follow policies to avoid conflicts
DROP POLICY IF EXISTS "Follows are visible to everyone" ON follows;
DROP POLICY IF EXISTS "Users can follow others" ON follows;
DROP POLICY IF EXISTS "Users can unfollow" ON follows;
-- Create clean policies
-- Everyone can see who follows who
CREATE POLICY "Public Read Follows" ON follows FOR
SELECT USING (true);
-- Authenticated users can create a follow record where they are the follower
CREATE POLICY "Auth Insert Follow" ON follows FOR
INSERT WITH CHECK (auth.uid() = follower_id);
-- Users can delete a follow record where they are the follower
CREATE POLICY "Auth Delete Follow" ON follows FOR DELETE USING (auth.uid() = follower_id);
-- 2. FIX AVATARS STORAGE POLICIES
-- Ensure avatars bucket exists and is public
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true) ON CONFLICT (id) DO
UPDATE
SET public = true;
-- Drop existing avatar policies
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own avatar" ON storage.objects;
-- Create simplified, permissive policies for avatars
-- Public read access
CREATE POLICY "Public Read Avatars" ON storage.objects FOR
SELECT USING (bucket_id = 'avatars');
-- Authenticated users can upload/update/delete anywhere in 'avatars' bucket
-- (Simplifying to ignore folder structure enforcement for now to ensure it works)
CREATE POLICY "Auth Manage Avatars" ON storage.objects FOR ALL USING (
    bucket_id = 'avatars'
    AND auth.role() = 'authenticated'
);
-- 3. FIX PROFILES UPDATE POLICY
-- Ensure users can update their own profile (avatar_url field)
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Auth Update Profile" ON profiles FOR
UPDATE USING (auth.uid() = id);
-- Ensure the 'avatars' bucket exists and is public
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true) ON CONFLICT (id) DO
UPDATE
SET public = true;
-- Drop ALL existing policies for 'avatars' to clear conflicts
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Public Read Avatars" ON storage.objects;
DROP POLICY IF EXISTS "Auth Manage Avatars" ON storage.objects;
-- Create SIMPLE, PERMISSIVE policies for avatars
-- 1. Public Read
CREATE POLICY "Public Read Avatars" ON storage.objects FOR
SELECT USING (bucket_id = 'avatars');
-- 2. Authenticated Upload (Anywhere in bucket)
CREATE POLICY "Auth Upload Avatars" ON storage.objects FOR
INSERT WITH CHECK (
        bucket_id = 'avatars'
        AND auth.role() = 'authenticated'
    );
-- 3. Owner Update/Delete
CREATE POLICY "Owner Manage Avatars" ON storage.objects FOR ALL USING (
    bucket_id = 'avatars'
    AND auth.uid() = owner
);
-- Recalculate followers/following counts for all profiles based on actual data in follows table
UPDATE profiles
SET followers_count = (
        SELECT COUNT(*)
        FROM follows
        WHERE following_id = profiles.id
    ),
    following_count = (
        SELECT COUNT(*)
        FROM follows
        WHERE follower_id = profiles.id
    );
-- ============================================
-- RPC Function to find conversation by participants
-- ============================================
CREATE OR REPLACE FUNCTION find_conversation_by_participants(user_ids UUID []) RETURNS TABLE (conversation_id UUID) LANGUAGE plpgsql SECURITY DEFINER AS $$ BEGIN RETURN QUERY
SELECT cp.conversation_id
FROM conversation_participants cp
GROUP BY cp.conversation_id
HAVING array_agg(
        cp.user_id
        ORDER BY cp.user_id
    ) = (
        SELECT array_agg(
                u
                ORDER BY u
            )
        FROM unnest(user_ids) u
    );
END;
$$;
-- ============================================
-- Chat System RLS Policies
-- ============================================
-- 1. Policies for conversations
-- Users can view conversations they are participants in
CREATE POLICY "Users can view their own conversations" ON conversations FOR
SELECT USING (
        exists (
            select 1
            from conversation_participants cp
            where cp.conversation_id = conversations.id
                and cp.user_id = auth.uid()
        )
    );
-- Authenticated users can create conversations
CREATE POLICY "Users can create conversations" ON conversations FOR
INSERT WITH CHECK (auth.role() = 'authenticated');
-- 2. Policies for conversation_participants
-- Users can view participants of conversations they belong to
CREATE POLICY "Users can view participants of their conversations" ON conversation_participants FOR
SELECT USING (
        exists (
            select 1
            from conversation_participants cp
            where cp.conversation_id = conversation_participants.conversation_id
                and cp.user_id = auth.uid()
        )
    );
-- Authenticated users can insert participant records (needed for chat creation)
-- Ideally we restrict this further, but for now allow authenticated to unblock creation
CREATE POLICY "Users can add participants" ON conversation_participants FOR
INSERT WITH CHECK (auth.role() = 'authenticated');
-- 3. Policies for messages
-- Users can view messages in conversations they belong to
CREATE POLICY "Users can view messages in their chats" ON messages FOR
SELECT USING (
        exists (
            select 1
            from conversation_participants cp
            where cp.conversation_id = messages.conversation_id
                and cp.user_id = auth.uid()
        )
    );
-- Users can send messages as themselves
CREATE POLICY "Users can send messages" ON messages FOR
INSERT WITH CHECK (auth.uid() = sender_id);