import { Request, Response } from "express";
import { OrderService } from "@api/services/OrderService";
import { ParamsDictionary } from "express-serve-static-core";

function getUserIdFromCookie(req: Request): number | null {
    const raw: unknown = req.cookies.user;
    const parsed: number = typeof raw === "string" ? parseInt(raw, 10) : NaN;
    return isNaN(parsed) ? null : parsed;
}

type OrderRequestBody = {
    orderNumber: string;
    totalPrice: number;
};

export class OrderController {
    private readonly _orderService: OrderService = new OrderService();

    public async createOrder(
        req: Request<ParamsDictionary, unknown, OrderRequestBody>,
        res: Response
    ): Promise<void> {
        const userId: number | null = getUserIdFromCookie(req);

        if (!userId) {
            res.status(401).json({ error: "Geen geldige gebruiker in cookie" });
            return;
        }

        const { orderNumber, totalPrice } = req.body;

        if (!orderNumber || !totalPrice) {
            res.status(400).json({ error: "orderNumber en totalPrice zijn verplicht" });
            return;
        }

        try {
            const orderId: number = await this._orderService.createOrder(
                userId,
                orderNumber,
                totalPrice
            );

            res.status(201).json({ message: "Bestelling geplaatst", orderId });
        }
        catch (error) {
            console.error("Fout bij aanmaken van bestelling:", error);
            res.status(500).json({ error: "Kon bestelling niet aanmaken." });
        }
    }

    public async getBoughtGames(req: Request, res: Response): Promise<void> {
        const userId: number | null = getUserIdFromCookie(req);

        if (!userId) {
            res.status(401).json({ error: "Geen geldige gebruiker in cookie" });
            return;
        }

        try {
            const games: { title: string; quantity: number; price: number }[] =
        await this._orderService.getCartItemsByUser(userId);
            res.status(200).json(games);
        }
        catch (error) {
            console.error("Fout bij ophalen van gekochte games:", error);
            res.status(500).json({ error: "Kon gekochte games niet ophalen." });
        }
    }
}
