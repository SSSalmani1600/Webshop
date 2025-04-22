import { Request, Response } from "express";
import { ProductService } from "@api/services/ProductService";
import type { Game } from "@api/types/Game";

export class ProductController {
    private readonly _productService: ProductService = new ProductService();

    public async getAllGames(_req: Request, res: Response): Promise<void> {
        try {
            const games: Game[] = await this._productService.getAllGames();
            res.json(games);
        }
        catch (error) {
            console.error("Fout bij ophalen van games:", error);
            res.status(500).json({ error: "Failed to fetch games." });
        }
    }

    public async getGamePrice(req: Request, res: Response): Promise<void> {
        const gameId: string = req.params.id;

        try {
            const priceRes: globalThis.Response = await fetch(`http://oege.ie.hva.nl:8889/api/productprices/${gameId}`);
            if (!priceRes.ok) throw new Error("Price API error");

            // eslint-disable-next-line @typescript-eslint/typedef, @typescript-eslint/no-unsafe-assignment
            const data = await priceRes.json();
            res.json(data);
        }
        catch (error) {
            console.error("Fout bij ophalen van prijs:", error);
            res.status(500).json({ error: "Failed to fetch price." });
        }
    }
}
