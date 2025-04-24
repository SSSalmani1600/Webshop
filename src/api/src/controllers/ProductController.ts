import { Request, Response } from "express";
import { ProductService } from "@api/services/ProductService";
import type { Game } from "@api/types/Game";
import { GamePrices } from "@api/types/GamePrices";

export class ProductController {
    // Create a private instance of the ProductService for database interaction
    private readonly _productService: ProductService = new ProductService();

    // Handle GET request to fetch all games
    public async getAllGames(_req: Request, res: Response): Promise<void> {
        try {
            // Use the ProductService to get all games from the database
            const games: Game[] = await this._productService.getAllGames();

            // Respond with the list of games in JSON format
            res.json(games);
        }
        catch (error) {
            // Log and handle any errors that occur
            console.error("Fout bij ophalen van games:", error);
            res.status(500).json({ error: "Failed to fetch games." });
        }
    }

    // Handle GET request to fetch the price of a specific game by ID
    public async getGamePrice(req: Request, res: Response): Promise<void> {
        // Extract the game ID from the request URL parameters
        const gameId: string = req.params.id;

        try {
            // Call an external API to retrieve the price information for the game
            const priceRes: globalThis.Response = await fetch(`http://oege.ie.hva.nl:8889/api/productprices/${gameId}`);

            // If the fetch fails, throw an error
            if (!priceRes.ok) throw new Error("Price API error");

            // Parse the JSON response and cast it to the expected GamePrices[] type
            const data: GamePrices[] = await priceRes.json() as GamePrices[];

            // Return the data as a JSON response
            res.json(data);
        }
        catch (error) {
            // Log and handle any errors that occur during the fetch
            console.error("Fout bij ophalen van prijs:", error);
            res.status(500).json({ error: "Failed to fetch price." });
        }
    }
}
