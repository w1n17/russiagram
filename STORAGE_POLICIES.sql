-- ============================================
-- Storage Buckets и RLS политики
-- ============================================
-- Выполните этот SQL ПОСЛЕ создания buckets через Dashboard

-- 1. RLS политики для AVATARS
-- ============================================

-- Все могут просматривать аватары
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Пользователи могут загружать свой аватар
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Пользователи могут обновлять свой аватар
CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Пользователи могут удалять свой аватар
CREATE POLICY "Users can delete own avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 2. RLS политики для POSTS
-- ============================================

-- Все могут просматривать посты
CREATE POLICY "Post media are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'posts');

-- Аутентифицированные пользователи могут загружать
CREATE POLICY "Authenticated users can upload posts"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'posts' 
  AND auth.role() = 'authenticated'
);

-- Пользователи могут удалять свои посты
CREATE POLICY "Users can delete own posts"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'posts' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 3. Проверка
-- ============================================

-- Проверить созданные buckets
SELECT id, name, public FROM storage.buckets;

-- Проверить политики
SELECT 
  policyname,
  tablename,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'storage'
ORDER BY tablename, policyname;
