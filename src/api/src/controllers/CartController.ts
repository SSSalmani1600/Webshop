import { Request, Response } from "express";
import { CartService } from "../services/CartService";
import type { CartItem } from "../types/CartItem";

export class CartController {
    private readonly _cartService: CartService;

    public constructor() {
        this._cartService = new CartService();
    }

    private getUserIdFromCookie(req: Request): number | null {
        const cookieHeader: string | undefined = req.headers.cookie;
        if (!cookieHeader) return null;

        const match: RegExpMatchArray | null = cookieHeader.match(/user=(\d+)/);
        return match ? parseInt(match[1], 10) : null;
    }

    public async getCart(req: Request, res: Response): Promise<void> {
        try {
            const userId: number | null = this.getUserIdFromCookie(req);
            if (!userId) {
                res.status(401).json({ error: "Niet ingelogd" });
                return;
            }

            const items: CartItem[] = await this._cartService.getCartItemsByUser(userId);
            const total: number = items.reduce((sum: number, item: CartItem) => sum + (item.price * item.quantity), 0);

            res.json({ cart: items, total });
        }
        catch (error) {
            console.error("Fout bij ophalen winkelwagen:", error);
            res.status(500).json({ error: "Fout bij ophalen winkelwagen" });
        }
    }

    public async deleteCartItem(req: Request, res: Response): Promise<void> {
        try {
            const userId: number | null = this.getUserIdFromCookie(req);
            if (!userId) {
                res.status(401).json({ error: "Niet ingelogd" });
                return;
            }

            const cartItemId: number = parseInt(req.params.id, 10);
            if (isNaN(cartItemId)) {
                res.status(400).json({ error: "Ongeldig cart item id" });
                return;
            }

            await this._cartService.deleteCartItemById(cartItemId, userId);
            res.status(204).send();
        }
        catch (error) {
            console.error("Fout bij verwijderen cart item:", error);
            res.status(500).json({ error: "Er is een fout opgetreden bij het verwijderen van het item" });
        }
    }
}
