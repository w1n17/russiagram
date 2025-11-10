export const ROUTES = {
  HOME: '/',
  EXPLORE: '/explore',
  REELS: '/reels',
  MESSAGES: '/messages',
  NOTIFICATIONS: '/notifications',
  CREATE: '/create',
  PROFILE: (username: string) => `/${username}`,
  POST: (postId: string) => `/p/${postId}`,
  REEL: (reelId: string) => `/r/${reelId}`,
  EDIT_PROFILE: '/accounts/edit',
  SETTINGS: '/settings',
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
} as const;

export const MAX_CAPTION_LENGTH = 2200;
export const MAX_BIO_LENGTH = 150;
export const MAX_POST_IMAGES = 10;
export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
export const STORY_DURATION = 24 * 60 * 60 * 1000; // 24 hours
export const MAX_REEL_DURATION = 90; // seconds

export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];
export const ACCEPTED_VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/webm'];
