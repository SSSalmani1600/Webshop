import { Request, Response } from "express";
import { GameSearchService } from "@api/services/SearchbarService";
import { Game } from "@api/types/Game";

export class GameSearchController {
    private readonly _gameSearchService: GameSearchService = new GameSearchService();

    public async searchGamesByTitle(req: Request, res: Response): Promise<void> {
        const query: string = req.query.query as string;

        if (!query || query.trim() === "") {
            res.status(400).json({ error: "Zoekterm ontbreekt." });
            return;
        }

        const cleanQuery: string = query.trim();

        try {
            const games: Game[] = await this._gameSearchService.searchGamesByTitle(cleanQuery);
            res.json(games);
        }
        catch (error) {
            console.error("Fout bij zoeken naar games:", error);
            res.status(500).json({ error: "Er is iets misgegaan bij het zoeken naar games." });
        }
    }
}
