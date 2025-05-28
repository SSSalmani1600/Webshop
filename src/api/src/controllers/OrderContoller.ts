import { Request, Response } from "express";
import { OrderService } from "@api/services/OrderService";
import { Request, Response } from "express-serve-static-core";
import { ParsedQs } from "qs";

const orderService: OrderService = new OrderService();

export class OrderController {
    getBoughtGames(req: Request<{}, any, any, ParsedQs, Record<string, any>>, res: Response<any, Record<string, any>, number>): void {
        throw new Error("Method not implemented.");
    }
    public async createOrder(req: Request, res: Response): Promise<void> {
        try {
            const sessionId: string | undefined = req.sessionId;

            if (!sessionId) {
                res.status(401).json({ error: "Geen geldige sessie" });
                return;
            }

            const { orderNumber, totalPrice } = req.body as { orderNumber: string; totalPrice: number };

            if (!orderNumber || !totalPrice) {
                res.status(400).json({ error: "orderNumber en totalPrice zijn verplicht" });
                return;
            }

            const orderId: number = await orderService.createOrder(sessionId, orderNumber, totalPrice);
            res.status(201).json({ message: "Bestelling geplaatst", orderId });
        }
        catch (error: unknown) {
            console.error(error);
            res.status(500).json({ error: "Kon bestelling niet aanmaken" });
        }
    }
}
