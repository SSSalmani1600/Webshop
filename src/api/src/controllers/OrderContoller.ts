import { Request,Response } from "express";
import { OrderService } from "@api/services/OrderService";

export class OrderController {
    private readonly _orderService: OrderService = new OrderService();
}
