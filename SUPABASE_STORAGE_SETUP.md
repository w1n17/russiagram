# 📦 Настройка Storage в Supabase

## Какие хранилища создать

### 1. Bucket: `avatars` (для аватаров пользователей)

**Настройки:**
```
Name: avatars
Public bucket: ✅ YES (публичный доступ)
File size limit: 2 MB
Allowed mime types: image/jpeg, image/png, image/webp
```

**RLS политики:**
```sql
-- Все могут читать
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Пользователи могут загружать свои аватары
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Пользователи могут обновлять свои аватары
CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Пользователи могут удалять свои аватары
CREATE POLICY "Users can delete own avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

### 2. Bucket: `posts` (для фото и видео постов)

**Настройки:**
```
Name: posts
Public bucket: ✅ YES (публичный доступ)
File size limit: 10 MB (фото), 100 MB (видео)
Allowed mime types: image/*, video/*
```

**RLS политики:**
```sql
-- Все могут читать посты
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
```

### 3. Bucket: `stories` (для Stories - опционально)

**Настройки:**
```
Name: stories
Public bucket: ✅ YES
File size limit: 5 MB
Allowed mime types: image/*, video/*
```

---

## 🔧 Как создать через Dashboard

### Шаг 1: Откройте Storage
1. Откройте Supabase Dashboard
2. Выберите ваш проект
3. В левом меню нажмите **Storage**

### Шаг 2: Создайте bucket "avatars"
1. Нажмите **"New bucket"**
2. Name: `avatars`
3. ✅ Поставьте галочку **"Public bucket"**
4. Нажмите **"Create bucket"**

### Шаг 3: Создайте bucket "posts"
1. Нажмите **"New bucket"**
2. Name: `posts`
3. ✅ Поставьте галочку **"Public bucket"**
4. Нажмите **"Create bucket"**

### Шаг 4: Настройте RLS политики
1. Перейдите в **SQL Editor**
2. Скопируйте и выполните SQL из `STORAGE_POLICIES.sql`

---

## 📝 Структура папок

### avatars/
```
avatars/
  └── {user_id}/
      └── avatar.jpg
```

Пример: `avatars/847e2272-3da1-4477-99c7-1a9a8c93e86b/avatar.jpg`

### posts/
```
posts/
  └── {user_id}/
      └── {post_id}/
          ├── 1.jpg
          ├── 2.jpg
          └── 3.jpg
```

Пример: `posts/847e2272-3da1-4477-99c7-1a9a8c93e86b/abc123/1.jpg`

---

## 💻 Использование в коде

### Загрузка аватара:
```typescript
import { supabase } from '@/shared/lib/supabase/client';

async function uploadAvatar(file: File, userId: string) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}/avatar.${fileExt}`;
  
  const { data, error } = await supabase.storage
    .from('avatars')
    .upload(fileName, file, {
      upsert: true // Перезаписать если существует
    });
  
  if (error) throw error;
  
  // Получить публичный URL
  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(fileName);
  
  return publicUrl;
}
```

### Загрузка фото для поста:
```typescript
async function uploadPostImage(file: File, userId: string, postId: string) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}/${postId}/${Date.now()}.${fileExt}`;
  
  const { data, error } = await supabase.storage
    .from('posts')
    .upload(fileName, file);
  
  if (error) throw error;
  
  const { data: { publicUrl } } = supabase.storage
    .from('posts')
    .getPublicUrl(fileName);
  
  return publicUrl;
}
```

### Удаление файла:
```typescript
async function deletePostImages(userId: string, postId: string) {
  const { data: files } = await supabase.storage
    .from('posts')
    .list(`${userId}/${postId}`);
  
  if (files && files.length > 0) {
    const filePaths = files.map(file => 
      `${userId}/${postId}/${file.name}`
    );
    
    await supabase.storage
      .from('posts')
      .remove(filePaths);
  }
}
```

---

## 🔒 Безопасность

### Что нужно проверить:
1. ✅ Все buckets PUBLIC (для публичного доступа к медиа)
2. ✅ RLS политики настроены (только владелец может удалять)
3. ✅ File size limits установлены
4. ✅ Mime types ограничены (только images/videos)

### ВАЖНО:
- Public bucket НЕ значит что кто угодно может загружать
- RLS политики контролируют КТО может загружать/удалять
- Public только для ЧТЕНИЯ (viewing)
- Загрузка/удаление контролируется через RLS

---

## 🧪 Проверка

После создания buckets проверьте:

```sql
-- Проверить что buckets созданы
SELECT * FROM storage.buckets;

-- Должно быть:
-- id: avatars, public: true
-- id: posts, public: true

-- Проверить политики
SELECT * FROM storage.policies;
```

---

## 📊 Размеры и лимиты

### Рекомендуемые лимиты:

**Avatars:**
- Max size: 2 MB
- Formats: JPG, PNG, WebP
- Dimensions: макс 500x500px (ресайз на клиенте)

**Posts:**
- Photos: 10 MB
- Videos: 100 MB
- Formats: JPG, PNG, WebP, MP4, MOV
- Dimensions: макс 1080x1350px (Instagram format)

### Оптимизация:
1. Сжимайте изображения на клиенте перед загрузкой
2. Используйте WebP для лучшего сжатия
3. Генерируйте thumbnails для больших изображений
4. Для видео - транскодируйте в MP4 H.264

---

## ✅ Checklist

Выполните по порядку:

- [ ] Создан bucket `avatars` (public)
- [ ] Создан bucket `posts` (public)
- [ ] Выполнен SQL для RLS политик
- [ ] Проверено что buckets видны в Dashboard
- [ ] Протестирована загрузка файла через Dashboard
- [ ] Обновлен код для использования storage

**После настройки storage приложение сможет загружать реальные фото!** 🎉
