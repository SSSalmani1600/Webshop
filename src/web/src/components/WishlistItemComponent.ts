import { WishlistService } from "../services/WishlistService";
import { WishlistItem } from "../../../api/src/types/WishlistItem";

export class WishlistItemComponent extends HTMLElement {
    protected itemId: number;
    protected itemTitle: string;
    protected itemThumbnail: string;
    protected gameId: number;
    private readonly wishlistService: WishlistService = new WishlistService();

    public constructor(item: unknown) {
        super();

        if (!item || typeof item !== "object") {
            throw new Error("Invalid item passed to WishlistItemComponent");
        }

        const wishlistItem: WishlistItem = item as WishlistItem;

        if (
            typeof wishlistItem.id !== "number" ||
            typeof wishlistItem.game_id !== "number" ||
            typeof wishlistItem.title !== "string" ||
            typeof wishlistItem.thumbnail !== "string"
        ) {
            throw new Error("Invalid WishlistItem structure");
        }

        this.itemId = wishlistItem.id;
        this.itemTitle = wishlistItem.title;
        this.itemThumbnail = wishlistItem.thumbnail;
        this.gameId = wishlistItem.game_id;
    }

    private async deleteWishlistItem(event: Event): Promise<void> {
        event.stopPropagation();

        try {
            await this.wishlistService.deleteWishlistItem(this.itemId);

            this.remove();

            const customEvent: CustomEvent = new CustomEvent("wishlistItemDeleted", {
                bubbles: true,
                composed: true,
                detail: { itemId: this.itemId },
            });
            this.dispatchEvent(customEvent);
        }
        catch (error) {
            console.error("Error deleting wishlist item:", error);
            alert("Er is een fout opgetreden bij het verwijderen van het item.");
        }
    }

    public connectedCallback(): void {
        this.render();
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

                .delete-button {
                    background-color: #ff4444;
                    color: white;
                    border: none;
                    padding: 8px 16px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 0.9rem;
                    margin-top: 0.5rem;
                    transition: background-color 0.2s ease;
                }

                .delete-button:hover {
                    background-color: #ff6666;
                }

                @media (max-width: 768px) {
                    .wishlist-item {
                        max-width: 100%;
                    }
                }
            </style>

            <div class="wishlist-item" onclick="window.location.href='gameDetail.html?id=${this.gameId}'">
                <img src="${this.itemThumbnail}" alt="${this.itemTitle}" loading="lazy">
                <div class="item-content">
                    <h3 class="item-title">${this.itemTitle}</h3>
                    <button class="delete-button" onclick="event.stopPropagation()">Verwijderen</button>
                </div>
            </div>
        `;

        const deleteButton: HTMLButtonElement | null = this.querySelector(".delete-button");
        deleteButton?.addEventListener("click", this.deleteWishlistItem.bind(this));
    }
}

customElements.define("wishlist-item", WishlistItemComponent);
