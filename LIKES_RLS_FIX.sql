-- ИСПРАВЛЕНИЕ RLS ПОЛИТИК ДЛЯ ЛАЙКОВ
-- Выполните этот скрипт в Supabase SQL Editor

-- 1. Удаляем старые политики
DROP POLICY IF EXISTS "Users can view all likes" ON likes;
DROP POLICY IF EXISTS "Users can insert their own likes" ON likes;
DROP POLICY IF EXISTS "Users can delete their own likes" ON likes;

-- 2. Создаём правильные политики
-- Просмотр всех лайков (для счётчиков и проверки is_liked)
CREATE POLICY "Anyone can view likes"
ON likes FOR SELECT
USING (true);

-- Добавление своих лайков
CREATE POLICY "Users can insert their own likes"
ON likes FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Удаление своих лайков
CREATE POLICY "Users can delete their own likes"
ON likes FOR DELETE
USING (auth.uid() = user_id);

-- 3. Проверяем что RLS включен
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

-- ГОТОВО! Теперь лайки должны работать.
