import { Request, Response } from "express";
import { WishlistService } from "../services/WishlistService";
import { WishlistItem } from "../types/WishlistItem";

const wishlistService: WishlistService = new WishlistService();

function getUserIdFromCookie(req: Request): number | null {
    const cookieHeader: string | undefined = req.headers.cookie;
    if (!cookieHeader) return null;

    const match: RegExpMatchArray | null = cookieHeader.match(/(?:^|;\s*)user=(\d+)/);
    return match ? parseInt(match[1], 10) : null;
}

export class WishlistController {
    public async getWishlist(req: Request, res: Response): Promise<void> {
        try {
            const userId: number | null = getUserIdFromCookie(req);

            if (!userId) {
                res.status(401).json({ error: "Geen geldige gebruiker in cookie" });
                return;
            }

            const items: WishlistItem[] = await wishlistService.getWishlistItemsByUser(userId);
            res.json(items);
        }
        catch (error) {
            console.error("Error fetching wishlist:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    }

    public async deleteWishlistItem(req: Request, res: Response): Promise<void> {
        const userId: number | null = getUserIdFromCookie(req);
        const wishlistItemId: number = parseInt(req.params.id, 10);

        if (!userId || isNaN(wishlistItemId)) {
            res.status(400).json({ error: "Ongeldige gebruiker of wishlist item id" });
            return;
        }

        try {
            await wishlistService.deleteWishlistItemById(wishlistItemId, userId);
            res.status(204).send();
        }
        catch (error) {
            console.error("Error deleting wishlist item:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    }
}
