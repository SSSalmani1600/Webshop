import { Request, Response } from "express";
import { RandomGameService, RandomGameData } from "../services/RandomGameService";

/**
 * Controller voor het afhandelen van willekeurige game requests
 * Handelt "Verras mij" functionaliteit af
 */
export class RandomGameController {
    private readonly _randomGameService: RandomGameService;

    public constructor() {
        this._randomGameService = new RandomGameService();
    }

    /**
     * Handelt het request af voor het ophalen van een willekeurige game
     * Endpoint: GET /api/games/random
     */
    public async getRandomGame(_req: Request, res: Response): Promise<void> {
        try {
            const randomGame: RandomGameData | null = await this._randomGameService.getRandomGame();

            if (!randomGame) {
                res.status(404).json({
                    success: false,
                    message: "Geen games gevonden in de database",
                });
                return;
            }

            const totalGames: number = await this._randomGameService.getTotalGamesCount();

            res.status(200).json({
                success: true,
                message: "Willekeurige game succesvol opgehaald",
                game: randomGame,
                totalGames: totalGames,
            });
        }
        catch (error) {
            console.error("RandomGameController error:", error);
            res.status(500).json({
                success: false,
                message: "Er is een fout opgetreden bij het ophalen van een willekeurige game",
            });
        }
    }
};
