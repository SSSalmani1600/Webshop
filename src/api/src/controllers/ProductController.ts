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
}
