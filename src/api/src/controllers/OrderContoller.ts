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
        
        }
    }

}
