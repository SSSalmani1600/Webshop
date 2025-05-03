import { Request, Response } from "express";
import CartService from "../services/CartService";

const cartService = new CartService();

export default class CheckoutController {
  async getCheckoutData(req: Request, res: Response) {
    try {
      const data = await cartService.getCartData(req);
      res.status(200).json(data);
    } catch (error) {

        console.error("Fout in CheckoutController:", error);
      res.status(500).json({ error: "Serverfout bij ophalen checkout-data" });
    }
  }
}
