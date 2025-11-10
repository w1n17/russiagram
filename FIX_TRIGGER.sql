-- ============================================
-- КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Автосоздание профилей
-- ============================================

-- 1. Удалить старый триггер если есть
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 2. Создать функцию триггера
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
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
  WHEN OTHERS THEN
    -- Логируем ошибку но не прерываем регистрацию
    RAISE WARNING 'Could not create profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- 3. Создать триггер
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 4. ВАЖНО: Создать профили для существующих пользователей БЕЗ профилей
INSERT INTO public.profiles (id, username, full_name, created_at, updated_at)
SELECT 
  au.id,
  split_part(au.email, '@', 1) as username,
  COALESCE(au.raw_user_meta_data->>'full_name', '') as full_name,
  au.created_at,
  NOW() as updated_at
FROM auth.users au
LEFT JOIN public.profiles p ON p.id = au.id
WHERE p.id IS NULL;

-- 5. Проверка
SELECT 
  'Users without profiles' as check_name,
  COUNT(*) as count
FROM auth.users au
LEFT JOIN public.profiles p ON p.id = au.id
WHERE p.id IS NULL;

-- Должно вернуть 0!
