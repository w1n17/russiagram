import { supabase } from './client';

/**
 * Загрузка файла в Supabase Storage
 */
export async function uploadFile(
  bucket: 'avatars' | 'posts' | 'stories',
  path: string,
  file: File
) {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      upsert: true,
      contentType: file.type,
    });

  if (error) {
    console.error('Upload error:', error);
    throw error;
  }

  // Получаем публичный URL
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);

  return publicUrl;
}

/**
 * Загрузка аватара пользователя
 */
export async function uploadAvatar(userId: string, file: File) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}/avatar.${fileExt}`;
  
  return uploadFile('avatars', fileName, file);
}

/**
 * Загрузка изображений для поста
 */
export async function uploadPostImages(userId: string, postId: string, files: File[]) {
  const uploadPromises = files.map(async (file, index) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${postId}/${Date.now()}_${index}.${fileExt}`;
    
    return uploadFile('posts', fileName, file);
  });

  return Promise.all(uploadPromises);
}

/**
 * Удаление файла из Storage
 */
export async function deleteFile(bucket: 'avatars' | 'posts' | 'stories', path: string) {
  const { error } = await supabase.storage
    .from(bucket)
    .remove([path]);

  if (error) {
    console.error('Delete error:', error);
    throw error;
  }
}

/**
 * Удаление изображений поста
 */
export async function deletePostImages(userId: string, postId: string) {
  const { data: files } = await supabase.storage
    .from('posts')
    .list(`${userId}/${postId}`);

  if (files && files.length > 0) {
    const filePaths = files.map(file => `${userId}/${postId}/${file.name}`);
    
    const { error } = await supabase.storage
      .from('posts')
      .remove(filePaths);

    if (error) {
      console.error('Delete error:', error);
      throw error;
    }
  }
}
