export type HeaderMenuItemVariant = 'default' | 'danger';

export type HeaderMenuItem = {
    key: string;
    label: string;
    href: string;
    method?: 'get' | 'post';
    variant?: HeaderMenuItemVariant;
};
