import type { LucideIcon } from 'lucide-vue-next';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavItem {
    title: string;
    href: string;
    icon?: LucideIcon;
    isActive?: boolean;
}

export interface SharedData {
    [key: string]: unknown;
    name: string;
    appVersion: string;
    locale: 'lv' | 'en';
    quote: { message: string; author: string };
    auth: Auth;
    emailVerified: boolean;
    emailVerificationSentAt: string | null;
    pendingFriendRequestsCount: number;
    pendingLobbyInvites?: LobbyInvite[];
    activeLobby?: ActiveLobby | null;
    ziggy: {
        location: string;
        url: string;
        port: null | number;
        defaults: Record<string, unknown>;
        routes: Record<string, string>;
    };
}

export interface User {
    id: number;
    name: string;
    email: string;
    locale?: string | null;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface ActiveLobby {
    uuid: string;
    mode: 'online' | 'local';
    is_host: boolean;
    status: 'lobby' | 'active';
    lobby_code: string | null;
    player_count: number;
}

export interface LobbyInvite {
    id: number;
    match_uuid: string;
    host_name: string;
    lobby_code: string | null;
    player_count: number;
    created_at?: string | null;
}

export type BreadcrumbItemType = BreadcrumbItem;

export type { HeaderMenuItem, HeaderMenuItemVariant } from './header';
