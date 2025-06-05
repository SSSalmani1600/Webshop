import { Request, Response } from "express";
import { ShowHomepageGamesService } from "../services/ShowHomepageGamesService";
import type { Game } from "../types/Game";

/**
 * Controller voor het afhandelen van homepage games requests
 * Handelt het ophalen van uitgelichte games voor de homepage af
 */
export class ShowHomepageGamesController {
    private readonly _showHomepageGamesService: ShowHomepageGamesService;

    public constructor() {
        this._showHomepageGamesService = new ShowHomepageGamesService();
    }

    /**
     * Handelt het request af voor het ophalen van uitgelichte games voor de homepage
     * Haalt een beperkt aantal games op die getoond worden als featured games
     *
     * @param _req - Het Express Request object (niet gebruikt voor deze endpoint)
     * @param res - Het Express Response object voor het terugsturen van de response
     */
    public async getHomepageGames(_req: Request, res: Response): Promise<void> {
        try {
            // Gebruik de service om uitgelichte games op te halen
            const featuredGames: Game[] = await this._showHomepageGamesService.getFeaturedGames();

            // Stuur de games terug als JSON response
            res.status(200).json({
                success: true,
                data: featuredGames,
            });
        }
        catch (error) {
            console.error("Fout bij ophalen van homepage games:", error);
            res.status(500).json({
                success: false,
                message: "Er is een fout opgetreden bij het ophalen van de uitgelichte games",
            });
        }
    }
}
