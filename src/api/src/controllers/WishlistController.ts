import { Request, Response } from "express";
import { WishlistService } from "../services/WishlistService";
import { WishlistItem } from "../types/WishlistItem";

const wishlistService: WishlistService = new WishlistService();

export class WishlistController {
    public async getWishlist(req: Request, res: Response): Promise<void> {
        try {
            const userId: number | undefined = req.userId;

            if (!userId) {
                res.status(401).json({ error: "Gebruiker is niet ingelogd" });
                return;
            }

            const items: WishlistItem[] = await wishlistService.getWishlistItemsByUser(userId);
            res.json(items);
        }
        catch (error) {
            console.error("Error fetching wishlist:", error);
            res.status(500).json({ error: "Er is een fout opgetreden bij het ophalen van de favorieten" });
        }
    }

    public async deleteWishlistItem(req: Request, res: Response): Promise<void> {
        const userId: number | undefined = req.userId;
        const wishlistItemId: number = parseInt(req.params.id, 10);

        if (!userId) {
            res.status(401).json({ error: "Gebruiker is niet ingelogd" });
            return;
        }

        if (isNaN(wishlistItemId)) {
            res.status(400).json({ error: "Ongeldig item ID" });
            return;
        }

        try {
            await wishlistService.deleteWishlistItemById(wishlistItemId, userId);
            res.status(204).send();
        }
        catch (error) {
            console.error("Error deleting wishlist item:", error);
            res.status(500).json({ error: "Er is een fout opgetreden bij het verwijderen van het item" });
        }
    }
}
