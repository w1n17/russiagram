-- ИСПРАВЛЕНИЕ RLS ПОЛИТИК ДЛЯ КОММЕНТАРИЕВ
-- Выполните этот скрипт в Supabase SQL Editor НЕМЕДЛЕННО!

-- 1. Удаляем старые политики (если есть)
DROP POLICY IF EXISTS "Anyone can view comments" ON comments;
DROP POLICY IF EXISTS "Users can insert their own comments" ON comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON comments;

-- 2. Создаём правильные политики
-- Просмотр всех комментариев
CREATE POLICY "Anyone can view comments"
ON comments FOR SELECT
USING (true);

-- Добавление своих комментариев
CREATE POLICY "Users can insert their own comments"
ON comments FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Удаление своих комментариев
CREATE POLICY "Users can delete their own comments"
ON comments FOR DELETE
USING (auth.uid() = user_id);

-- 3. Включаем RLS
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- ГОТОВО! Теперь комментарии должны работать.
