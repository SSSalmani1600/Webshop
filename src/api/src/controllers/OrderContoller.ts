import { Request, Response } from "express";
import { OrderService } from "@api/services/OrderService";

type OrderRequestBody = {
    orderNumber: string;
    totalPrice: number;
};

export class OrderController {
    private readonly _orderService: OrderService = new OrderService();

    public async createOrder(
        req: Request<unknown, unknown, OrderRequestBody>,
        res: Response
    ): Promise<void> {
        const sessionId: string | undefined = req.sessionId;

        if (!sessionId) {
            res.status(401).json({ error: "Geen geldige sessie" });
            return;
        }

        const { orderNumber, totalPrice } = req.body;

        if (!orderNumber || !totalPrice) {
            res.status(400).json({ error: "orderNumber en totalPrice zijn verplicht" });
            return;
        }

        try {
            const orderId: number = await this._orderService.createOrder(
                sessionId,
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
        const sessionId: string | undefined = req.sessionId;

        if (!sessionId) {
            res.status(401).json({ error: "Geen geldige sessie" });
            return;
        }

        try {
            const games: { title: string; quantity: number; price: number }[] =
              await this._orderService.getCartItemsBySession(sessionId);
            res.status(200).json(games);
        }
        catch (error) {
            console.error("Fout bij ophalen van gekochte games:", error);
            res.status(500).json({ error: "Kon gekochte games niet ophalen." });
        }
    }
}
