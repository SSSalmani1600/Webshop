import { Request, Response } from "express";
import { ProductService } from "@api/services/ProductService";
import type { Game } from "@api/types/Game";
import { GamePrices } from "@api/types/GamePrices";
import { NewProduct } from "@api/types/NewProduct";


/**
 * Controller class for handling product-related API routes.
 */
export class ProductController {
    private readonly _productService: ProductService = new ProductService();

    /**
     * Handles GET request to retrieve all games from the database.
     * @param _req - Express Request object (unused).
     * @param res - Express Response object to send the list of games.
     */
    public async getAllGames(_req: Request, res: Response): Promise<void> {
        try {
            const games: Game[] = await this._productService.getAllGames();
            res.json(games);
        }
        catch {
            res.status(500).json({ error: "Failed to fetch games." });
        }
    }

    /**
     * Handles GET request to retrieve the price information for a specific game.
     * @param req - Express Request object containing the game ID in params.
     * @param res - Express Response object to send the price data.
     */
    public async getGamePrice(req: Request, res: Response): Promise<void> {
        const gameId: string = req.params.id;

        try {
            const priceRes: globalThis.Response = await fetch(`http://oege.ie.hva.nl:8889/api/productprices/${gameId}`);

            if (!priceRes.ok) {
                throw new Error("Price API error");
            }

            const data: GamePrices[] = await priceRes.json() as GamePrices[];
            res.json(data);
        }
        catch {
            res.status(500).json({ error: "Failed to fetch price." });
        }
    }

    /**
     * Handles POST request to add a new product to the database.
     * @param req - Express Request object containing new product data in body.
     * @param res - Express Response object to confirm creation.
     */
    public async addProduct(req: Request, res: Response): Promise<void> {
        try {
            const newProduct: NewProduct = req.body as NewProduct;
            await this._productService.addProduct(newProduct);
            res.status(201).json({ message: "Product succesvol toegevoegd." });
        }
        catch {
            res.status(500).json({ error: "Failed to add product." });
        }
    }

    /**
     * Handles PATCH request to change the visibility (hidden) status of a product.
     * @param req - Express Request object containing game ID in params and hidden status in body.
     * @param res - Express Response object to confirm update.
     */
    public async hideProduct(req: Request, res: Response): Promise<void> {
        try {
            const gameId: number = parseInt(req.params.id, 10);
            const { hidden } = req.body as { hidden: boolean };

            if (isNaN(gameId) || typeof hidden !== "boolean") {
                res.status(400).json({ error: "Invalid input" });
                return;
            }

            await this._productService.setHidden(gameId, hidden);
            res.status(200).json({ message: `Product succesvol ${hidden ? "verborgen" : "zichtbaar gemaakt"}.` });
        }
        catch {
            res.status(500).json({ error: "Zichtbaarheid wijzigen mislukt." });
        }
    }
}

