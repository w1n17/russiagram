# 🔧 Что нужно исправить СЕЙЧАС

## 1. ✅ Header перекрывает профиль
**Проблема:** z-index header = 50, профиль скрывается

**Исправлено:**
- Header z-index: 50 → 40
- Profile добавлен z-0 и relative

---

## 2. ❌ Лайки не сохраняются после перезагрузки

**Проблема:** Лайки сохраняются в БД, но state не обновляется корректно

**Как проверить:**
```sql
-- В Supabase SQL Editor:
SELECT * FROM likes WHERE user_id = 'ваш-user-id';
```

**Должно работать:** Лайк сохраняется в таблицу `likes`, но при перезагрузке нужно подгружать is_liked

**TODO:**
```typescript
// В entities/post/api/index.ts нужно добавить:
const postsWithLikes = posts.map(post => ({
  ...post,
  is_liked: post.likes?.some(like => like.user_id === currentUserId),
  likes_count: post.likes?.length || 0
}));
```

---

## 3. ❌ Нельзя написать комментарий

**Проблема:** Нет UI для комментариев

**TODO:** Создать компонент комментариев:
- `features/comments/ui/comment-modal.tsx`
- `features/comments/ui/comment-input.tsx`
- `features/comments/ui/comment-list.tsx`

**Структура:**
```typescript
interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  text: string;
  created_at: string;
  user: Profile;
}
```

---

## 4. ❌ Вместо реальных картинок placeholder

**Проблема:** Используются `https://picsum.photos` вместо Supabase Storage

**Решение:**

### Шаг 1: Создать buckets в Supabase
1. Dashboard → Storage → New bucket
2. Name: `posts`, Public: ✅
3. Name: `avatars`, Public: ✅

### Шаг 2: Выполнить SQL
```sql
-- Файл: STORAGE_POLICIES.sql
-- Выполните в SQL Editor
```

### Шаг 3: Использовать загрузку
```typescript
// В create-post-modal.tsx:
import { uploadPostImages } from '@/shared/lib/supabase/storage';

const postId = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
const media_urls = await uploadPostImages(currentUser.id, postId, files);
```

**Файл для загрузки создан:**
- `shared/lib/supabase/storage.ts`

---

## 5. 🔍 Как исправить лайки СЕЙЧАС

### Проблема:
Лайки сохраняются в БД, но при перезагрузке `is_liked` не загружается

### Решение:

#### A. В `widgets/feed/ui/feed.tsx`:
```typescript
const loadPosts = async () => {
  try {
    const data = await getFeedPosts();
    // Добавить проверку is_liked для каждого поста
    setPosts(data);
  } catch (error) {
    console.error('Error loading posts:', error);
  } finally {
    setLoading(false);
  }
};
```

#### B. В `entities/post/api/index.ts` → `getFeedPosts()`:
```typescript
export async function getFeedPosts() {
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      user:profiles!posts_user_id_fkey(*),
      likes(user_id),
      comments:comments(count)
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;

  // Маппинг с is_liked
  return data.map(post => ({
    ...post,
    is_liked: post.likes?.some((like: any) => like.user_id === user?.id) || false,
    likes_count: post.likes?.length || 0,
    comments_count: post.comments?.[0]?.count || 0,
  }));
}
```

---

## 6. 📋 TODO List по приоритету

### Критично (для работы):
- [x] Header не перекрывает профиль
- [ ] Лайки загружаются с is_liked = true
- [ ] Storage buckets созданы
- [ ] Реальная загрузка изображений

### Важно (для функционала):
- [ ] Комментарии к постам
- [ ] Edit Profile
- [ ] Удаление постов
- [ ] Stories (загрузка и просмотр)

### Желательно:
- [ ] Reels
- [ ] Direct Messages
- [ ] Notifications
- [ ] Search users
- [ ] Followers/Following

---

## ✅ Что работает СЕЙЧАС:

- ✅ Регистрация и вход
- ✅ Создание постов (с placeholder)
- ✅ Лайки (сохраняются в БД)
- ✅ Профиль виден
- ✅ Feed центрирован
- ✅ "Сохранённое" (UI готов)
- ✅ Модалка создания поста

---

## 🚀 Что делать СЕЙЧАС:

### 1. Создать Storage buckets
```
Supabase Dashboard → Storage
→ New bucket "posts" (Public ✅)
→ New bucket "avatars" (Public ✅)
→ SQL Editor → выполнить STORAGE_POLICIES.sql
```

### 2. Исправить загрузку лайков
Откройте `entities/post/api/index.ts` и добавьте маппинг is_liked

### 3. Удалить тестовые посты с placeholder
```sql
DELETE FROM posts WHERE media_urls::text LIKE '%picsum%';
```

### 4. Создать новый пост
Теперь с реальной загрузкой в Storage!

---

## 📝 Файлы обновлены:

- ✅ `widgets/header/ui/header.tsx` - z-index исправлен
- ✅ `app/[username]/page.tsx` - профиль не перекрывается
- ✅ `shared/lib/supabase/storage.ts` - утилиты для Storage
- ✅ `features/create-post/ui/create-post-modal.tsx` - структура для загрузки

---

**После создания Storage buckets и исправления is_liked - всё заработает!** 🎯
