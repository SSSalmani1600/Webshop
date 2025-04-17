import { Request, Response } from "express";
import { CartService } from "../services/CartService";

const cartService = new CartService();

function getSessionIdFromCookie(req: Request): string | null {
    const cookie = req.headers.cookie;
    if (!cookie) return null;
  
    const match = cookie.match(/session=([^;]+)/);
    return match ? match[1] : null;
}
  

export class CartController {
    public async getCart(req: Request, res: Response): Promise<void> {
        try {
          const sessionId = getSessionIdFromCookie(req);

      
          if (!sessionId) {
            res.status(401).json({ error: "Geen geldige sessie" });
            return;
          }
      
          const items = await cartService.getCartItems(sessionId);
          res.json({ cart: items });
        } catch (error) {
          res.status(500).json({ error: "Kon winkelwagen niet ophalen" });
        }
      }
}
