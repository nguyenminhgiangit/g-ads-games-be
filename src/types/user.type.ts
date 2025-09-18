export const GENDER_ENUM = ['male', 'female', 'other'] as const;           // runtime (dùng cho Mongoose enum)
export type GenderType = (typeof GENDER_ENUM)[number]; // = 'male' | 'female' | 'other'

export const ROLE_ENUM = ['user', 'admin'] as const;           // runtime (dùng cho Mongoose enum)
export type RoleType = (typeof ROLE_ENUM)[number];

export type GameUser = {
    id: string;
    displayName: string;
};