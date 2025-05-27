export interface Game {
    id: number;
    title: string;
    thumbnail: string;
    descriptionMarkdown: string;
    descriptionHtml: string;
    url: string;
    images?: string | null;
    authors: string;
    tags: string;
    price?: number | null;
    hidden: boolean;
}
