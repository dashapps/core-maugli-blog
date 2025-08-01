export type Image = {
    src: string;
    alt?: string;
    caption?: string;
};

export type Link = {
    text: string;
    href: string;
};

export type Hero = {
    title?: string;
    text?: string;
    image?: Image;
    actions?: Link[];
};

export type Subscribe = {
    title?: string;
    text?: string;
    formUrl: string;
};

export type Author = {
    name: string;
    type?: 'Person' | 'Organization';
    url?: string;
    avatar?: string;
    description?: string;
    sameAs?: string[]; // соцсети, профили
};

export type Publisher = {
    name: string;
    logo?: Image;
    url?: string;
    type?: 'Organization';
};

export type SiteConfig = {
    website: string;
    logo?: Image;
    title: string;
    subtitle?: string;
    description: string;
    image?: Image;
    author?: Author;
    publisher?: Publisher;
    locale?: string;
    headerNavLinks?: Link[];
    footerNavLinks?: Link[];
    socialLinks?: Link[];
    hero?: Hero;
    subscribe?: Subscribe;
    postsPerPage?: number;
    projectsPerPage?: number;
};

const siteConfig: SiteConfig = {
    website: 'https://techrev.maugli.cfd',
    title: 'ТехРев',
    subtitle: 'Блог об автоматизации с ИИ от ИИ-автора',
    description: 'Создание контента для соцсетей и блогов быстро, дешево и качественно',
    image: {
        src: 'tr-prewiew.png',
        alt: 'Автоматизация и ИИ -- новая технологическая революция',
        width: 1200,
        height: 630,
        caption: '...',
    },
    author: {
        name: 'ИльичAI',
        type: 'Person',
        url: 'https://techrev.maugli.cfd/about',
        avatar: '/img/ilichai-avatar.png',
        description: 'AI-эксперт, созданный в Maugli Content Farm, работает на GPT4.1, редактор и аналитик.',
        sameAs: [
            'https://t.me/techrev_maugli',
            'https://twitter.com/',  // другие профили по желанию
        ]
    },
    publisher: {
        name: 'Maugli Content Farm',
        logo: {
            src: '/logo.svg',
            alt: 'Maugli Content Farm'
        },
        url: 'https://maugli.cfd',
        type: 'Organization'
    },
    locale: 'ru_RU',
    headerNavLinks: [
        {
            text: 'Блог',
            href: '/'
        },
        {
            text: 'Сервисы',
            href: '/projects'
        },
        {
            text: 'Авторы',
            href: '/authors'
        },
        {
            text: 'Теги и рубрики',
            href: '/tags'
        }
    ],
    footerNavLinks: [
        {
            text: 'О блоге',
            href: '/about'
        },
        {
            text: 'Контакты',
            href: '/contact'
        },
        {
            text: 'О Maugli',
            href: '/terms'
        }
    ],
    socialLinks: [
        {
            text: 'Телеграм',
            href: 'https://t.me/techrev_maugli'
        },
        {
            text: 'Instagram',
            href: 'https://instagram.com/'
        },
        {
            text: 'X/Twitter',
            href: 'https://twitter.com/'
        }
    ],
    hero: {
        title: 'ТехРев — блог, освобождающий людей от ручного труда',
        text: " Канал ведет Ильич ИИ, заряженный верой в то, что может сделать жизнь людей проще",
        image: {
            src: '/hero.webp',
            alt: 'Автор блога Ильич ИИ прямо здесь и сейчас творит технологическую революию',
            width: 1200, // ← добавь
            height: 630 
        },
        actions: [
            {
                text: 'Внедрить в свои процессы контент-фабраку',
                href: '/contact'
            }
        ]
    },
    subscribe: {
        title: 'Подписаться на новости ТехРев',
        text: 'Еженедельный дайджесь заветов Ильича у вас на почте.',
        formUrl: '#'
    },
    postsPerPage: 12,
    projectsPerPage: 12
};

export default siteConfig;
