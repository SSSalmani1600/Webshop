import { Request, Response } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { OrderService } from "@api/services/OrderService";
import { MailService } from "@api/services/MailService";

function getUserIdFromCookie(req: Request): number | null {
    const raw: unknown = req.cookies.user;
    const parsed: number = typeof raw === "string" ? parseInt(raw, 10) : NaN;
    return isNaN(parsed) ? null : parsed;
}

type OrderRequestBody = {
    orderNumber: string;
    totalPrice: number;
};

type CartGame = {
    title: string;
    quantity: number;
    price: number;
};

export class OrderController {
    private readonly _orderService: OrderService = new OrderService();
    private readonly _mailService: MailService = new MailService();

    public async createOrder(
        req: Request<ParamsDictionary, unknown, OrderRequestBody>,
        res: Response
    ): Promise<void> {
        const userId: number | null = getUserIdFromCookie(req);

        if (!userId) {
            res.status(401).json({ error: "Geen geldige gebruiker in cookie" });
            return;
        }

        const { orderNumber, totalPrice }: OrderRequestBody = req.body;

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

            await this._orderService.saveGamesForOrder(userId, orderId);

            const email: string = await this._orderService.getUserEmailById(userId);
            const name: string = await this._orderService.getUserNameById(userId);
            const gamesInCart: CartGame[] = await this._orderService.getCartItemsByUser(userId);
            const gameTitles: string[] = gamesInCart.map(
                (item: CartGame): string => `${item.quantity}× ${item.title}`
            );

            await this._mailService.sendOrderConfirmation(
                name,
                email,
                orderNumber,
                gameTitles,
                totalPrice
            );

            res.status(201).json({ message: "Bestelling geplaatst en bevestiging verzonden", orderId });
        }
        catch (error: unknown) {
            console.error("Fout bij bestelling of mail:", error);
            res.status(500).json({ error: "Bestelling of e-mail verzenden mislukt." });
        }
    }

    public async getBoughtGames(
        req: Request,
        res: Response
    ): Promise<void> {
        const userId: number | null = getUserIdFromCookie(req);

        if (!userId) {
            res.status(401).json({ error: "Geen geldige gebruiker in cookie" });
            return;
        }

        try {
            const games: CartGame[] = await this._orderService.getCartItemsByUser(userId);
            res.status(200).json(games);
        }
        catch (error: unknown) {
            console.error("Fout bij ophalen van gekochte games:", error);
            res.status(500).json({ error: "Kon gekochte games niet ophalen." });
        }
    }

    public async getGamesForOrder(
        req: Request,
        res: Response
    ): Promise<void> {
        const userId: number | null = getUserIdFromCookie(req);
        const orderId: number = parseInt(req.params.orderId);

        if (!userId || isNaN(orderId)) {
            res.status(400).json({ error: "Ongeldige gebruiker of order ID" });
            return;
        }

        try {
            const games: { title: string; image_url: string; quantity: number; price: number }[] =
            await this._orderService.getGamesByOrderId(orderId);
            res.status(200).json(games);
        }
        catch (error: unknown) {
            console.error("Fout bij ophalen van gekochte games:", error);
            res.status(500).json({ error: "Kon gekochte games niet ophalen." });
        }
    }
}
