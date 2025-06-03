import { WishlistItem } from "../../../api/src/types/WishlistItem";

export class WishlistService {
    private readonly API_BASE: string = window.location.hostname.includes("localhost")
        ? "http://localhost:3001"
        : "https://laajoowiicoo13-pb4sea2425.hbo-ict.cloud/api";

    public async getWishlist(): Promise<WishlistItem[]> {
        const response: Response = await fetch(`${this.API_BASE}/wishlist`, {
            method: "GET",
            credentials: "include",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error("UNAUTHORIZED");
            }
            throw new Error(`Failed to fetch wishlist: ${response.statusText}`);
        }

        const data: unknown = await response.json();
        if (!Array.isArray(data)) {
            throw new Error("Invalid response format");
        }

        return data as WishlistItem[];
    }

    public async deleteWishlistItem(itemId: number): Promise<void> {
        const response: Response = await fetch(`${this.API_BASE}/wishlist/${itemId}`, {
            method: "DELETE",
            credentials: "include",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error("UNAUTHORIZED");
            }
            throw new Error("Failed to delete wishlist item");
        }
    }
}
