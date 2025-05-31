export class WishlistItemComponent extends HTMLElement {
    protected itemPrice: number;
    protected itemId: number;
    protected itemTitle: string;
    protected itemThumbnail: string;
    protected gameId: number;

    public constructor(item: unknown) {
        super();

        if (!item || typeof item !== "object") {
            throw new Error("Invalid item passed to WishlistItemComponent");
        }

        const wishlistItem: Record<string, unknown> = item as Record<string, unknown>;

        if (
            typeof wishlistItem.id !== "number" ||
            typeof wishlistItem.game_id !== "number" ||
            (typeof wishlistItem.price !== "number" && typeof wishlistItem.price !== "string") ||
            typeof wishlistItem.title !== "string" ||
            typeof wishlistItem.thumbnail !== "string"
        ) {
            throw new Error("Invalid WishlistItem structure");
        }

        this.itemPrice = typeof wishlistItem.price === "string" ? parseFloat(wishlistItem.price) : wishlistItem.price;
        this.itemId = wishlistItem.id;
        this.itemTitle = wishlistItem.title;
        this.itemThumbnail = wishlistItem.thumbnail;
        this.gameId = wishlistItem.game_id;
    }

    public render(): void {
        this.innerHTML = `
            <style>
                .wishlist-item {
                    background-color: #222121;
                    border-radius: 8px;
                    overflow: hidden;
                    transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
                    cursor: pointer;
                    position: relative;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                }

                .wishlist-item:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                }

                .wishlist-item img {
                    width: 100%;
                    aspect-ratio: 16/9;
                    object-fit: cover;
                }

                .item-content {
                    padding: 1rem;
                    flex-grow: 1;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                }

                .item-title {
                    margin: 0 0 0.5rem 0;
                    font-size: 1.1rem;
                    color: #fff;
                    font-weight: 500;
                    line-height: 1.4;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .item-price {
                    font-size: 1.2rem;
                    font-weight: bold;
                    color: white;
                    margin: 0.5rem 0;
                }

                @media (max-width: 768px) {
                    .wishlist-item {
                        max-width: 100%;
                    }
                }
            </style>

            <div class="wishlist-item" data-id="${this.itemId}">
                <img src="${this.itemThumbnail}" alt="${this.itemTitle}" loading="lazy">
                <div class="item-content">
                    <h3 class="item-title">${this.itemTitle}</h3>
                    <div class="item-price">€${this.itemPrice.toFixed(2)}</div>
                </div>
            </div>
        `;

        const wishlistItem: HTMLElement | null = this.querySelector(".wishlist-item");
        if (wishlistItem) {
            wishlistItem.addEventListener("click", () => {
                window.location.href = `gameDetail.html?id=${this.gameId}`;
            });
        }
    }

    public connectedCallback(): void {
        this.render();
    }
}

if (!customElements.get("wishlist-item")) {
    customElements.define("wishlist-item", WishlistItemComponent);
}
