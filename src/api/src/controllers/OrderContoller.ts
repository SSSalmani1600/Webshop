import { Request, Response } from "express";
import { OrderService } from "@api/services/OrderService";
import { sessionMiddleware } from "@api/middleware/sessionMiddleware";

export class OrderController {
    private readonly _orderService: OrderService = new OrderService();

    public async completeOrder(req: Request, res: Response): Promise<void> {
        const sessionId = req.sessionId!;
        const { orderNumber, totalPrice } = req.body;
    }

    if (!orderNumber || totalPrice === undefined) {
      res.status(400).json({ error: "Ordernummer of totaalprijs ontbreekt" });
      return;  
      
    } 
}
