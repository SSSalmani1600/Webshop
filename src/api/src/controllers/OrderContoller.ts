import { Request, Response } from "express";
import { OrderService } from "@api/services/OrderService";

const orderService = new OrderService();

function getSessionIdFromCookies(req: Request): string | null {
    const cookie = req.headers.cookie;
    if (!cookie) return null;

    const match = cookie.match(/session=([^;]+)/);
    return match ? match[1] : null;
}

export class OrderController {
    
}
