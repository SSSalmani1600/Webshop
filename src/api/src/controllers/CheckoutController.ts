import { Request, Response } from "express";
import CartService from "../services/CartService";

// Maak een instantie van de CartService om data op te halen
const cartService = new CartService();

// Controller-klasse voor de checkout-functionaliteit
export default class CheckoutController {
  // Methode om de checkout-data op te halen en terug te sturen naar frontend
  async getCheckoutData(req: Request, res: Response) {
    try {
      // Haal de winkelwagengegevens op via de CartService
      const data = await cartService.getCartData(req);
      // Stuur de data terug als JSON met status 200 (OK)
      res.status(200).json(data);
    } catch (error) {
      // Foutmelding bij problemen in de controller
      console.error("Fout in CheckoutController:", error);
      res.status(500).json({ error: "Serverfout bij ophalen checkout-data" });
    }
  }
}
