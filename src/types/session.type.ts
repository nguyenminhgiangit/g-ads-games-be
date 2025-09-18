export const PLATFORM_ENUM = ['web', 'ios', 'android'] as const;
export type PlatformType = (typeof PLATFORM_ENUM)[number];