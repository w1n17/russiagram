# 🖼️ Исправление ошибки изображений

## Проблема

```
Invalid src prop (https://picsum.photos/800/800?random=...) on `next/image`, 
hostname "picsum.photos" is not configured under images in your `next.config.js`
```

Это происходит потому что Next.js Image требует явного указания разрешенных доменов для безопасности.

---

## ✅ Решение

### Обновлен `next.config.ts`:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Для placeholder изображений (временно)
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      // Для Supabase Storage (все проекты)
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      // Для вашего конкретного проекта
      {
        protocol: 'https',
        hostname: 'afaqqzmdqlkezeefzsso.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

export default nextConfig;
```

---

## 🔧 Что делать дальше

### 1. Перезапустите dev server:

```bash
# Остановите текущий сервер (Ctrl+C)
npm run dev
```

**ВАЖНО:** Next.js config изменения требуют ПЕРЕЗАПУСКА dev server!

### 2. Обновите страницу:

```
http://localhost:3000
```

Изображения должны загрузиться!

---

## 📸 Использование реальных изображений

Когда создадите Storage buckets в Supabase, изображения будут загружаться так:

```
https://afaqqzmdqlkezeefzsso.supabase.co/storage/v1/object/public/posts/user-id/post-id/image.jpg
```

Это уже разрешено в `next.config.ts`!

---

## 🗑️ Удаление тестовых постов

Если хотите удалить посты с placeholder изображениями:

### Через Supabase Dashboard:
1. Table Editor → `posts`
2. Найдите ваши посты
3. Удалите их

### Или через SQL:
```sql
-- Удалить ВСЕ посты (осторожно!)
DELETE FROM posts;

-- Или удалить только свои посты
DELETE FROM posts WHERE user_id = 'ваш-user-id';
```

---

## ✅ Checklist

- [x] Обновлен `next.config.ts`
- [ ] Перезапущен dev server (`npm run dev`)
- [ ] Страница обновлена (F5)
- [ ] Изображения загружаются
- [ ] Созданы storage buckets в Supabase
- [ ] Готовы загружать реальные фото

---

## 🎯 Что дальше

После создания storage buckets (`avatars`, `posts`), обновите код создания поста чтобы загружать РЕАЛЬНЫЕ файлы вместо placeholder:

```typescript
// В features/create-post/ui/create-post-modal.tsx
// Вместо:
const media_urls = files.map((_, i) => 
  `https://picsum.photos/800/800?random=${Date.now() + i}`
);

// Используйте:
const uploadPromises = files.map(async (file, index) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${currentUser.id}/${postId}/${Date.now()}_${index}.${fileExt}`;
  
  const { error: uploadError } = await supabase.storage
    .from('posts')
    .upload(fileName, file);
  
  if (uploadError) throw uploadError;
  
  const { data } = supabase.storage
    .from('posts')
    .getPublicUrl(fileName);
  
  return data.publicUrl;
});

const media_urls = await Promise.all(uploadPromises);
```

---

## 🚀 Готово!

После перезапуска dev server изображения будут работать! 🎉
