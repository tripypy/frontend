export interface User {
    id: number;
    email?: string;
    nickname: string;
    profileImageUrl: string | null;
    bio?: string;
    friendsCount: number;
}
