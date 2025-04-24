import { Request, Response } from "express";
import { OrderService } from "@api/services/OrderService";

const orderService = new OrderService();

export class OrderController {
    public async createOrder(req: Request, res: Response): Promise<void> {
        try {
            const sessionId = req.sessionId;

            if (!sessionId) {
                res.status(401).json({ error: "Geen geldige sessie" });
                return;
            }

            const { orderNumber, totalPrice } = req.body;

            if (!orderNumber || !totalPrice) {
                res.status(400).json({ error: "orderNumber en totalPrice zijn verplicht" });
                return;
            }

            const orderId = await orderService.createOrder(sessionId, orderNumber, totalPrice);
            res.status(201).json({ message: "Bestelling geplaatst", orderId });
        }
        catch (error) {
            res.status(500).json({ error: "Kon bestelling niet aanmaken" });
        }
    }
}
