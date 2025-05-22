import { Request, Response } from "express";
import { CartService, CartItem } from "../services/CartService";

const cartService: CartService = new CartService();

function getUserIdFromCookie(req: Request): number | null {
    const cookieHeader: string | undefined = req.headers.cookie;
    console.log("Cookie header:", cookieHeader);

    if (!cookieHeader) {
        console.log("No cookie header found");
        return null;
    }

    const match: RegExpMatchArray | null = cookieHeader.match(/(?:^|;\s*)Authentication=(\d+)/);
    console.log("Authentication cookie match:", match);

    return match ? parseInt(match[1], 10) : null;
}

export class CartController {
    public async getCart(req: Request, res: Response): Promise<void> {
        try {
            const userId: number | null = getUserIdFromCookie(req);
            console.log("User ID from cookie:", userId);

            if (!userId) {
                console.log("No valid user ID found in cookie");
                res.status(401).json({ error: "Geen geldige gebruiker in cookie" });
                return;
            }

            const items: CartItem[] = await cartService.getCartItemsByUser(userId);
            console.log("Cart items found:", items);

            const total: number = items.reduce((sum, item) => {
                const price: number = typeof item.price === "string" ? parseFloat(item.price) : item.price;
                return sum + price * item.quantity;
            }, 0);

            res.json({
                cart: items,
                total,
            });
        }
        catch (error) {
            console.error("Error fetching cart:", error);
            res.status(500).json({ error: "error" });
        }
    }

    public async deleteCartItem(req: Request, res: Response): Promise<void> {
        const userId: number | null = getUserIdFromCookie(req);
        const cartItemId: number = parseInt(req.params.id, 10);

        if (!userId || isNaN(cartItemId)) {
            res.status(400).json({ error: "Ongeldige gebruiker of cart item id" });
            return;
        }

        try {
            await cartService.deleteCartItemById(cartItemId, userId);
            res.status(204).send();
        }
        catch {
            res.status(500).json({ error: "error" });
        }
    }
}
