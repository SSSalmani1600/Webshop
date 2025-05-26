import { Request, Response } from "express";
import { GameDetailService } from "@api/services/ProductDetailService";
import { Game } from "@api/types/Game";

export class GameDetailController {
    private readonly _gameDetailService: GameDetailService = new GameDetailService();

    public async getGameById(req: Request, res: Response): Promise<void> {
        const gameId: string = req.query.id as string;
        console.log("test");
        if (!gameId) {
            res.status(400).json({ error: "Game ID ontbreekt." });
            return;
        }

        try {
            const game: Game | null = await this._gameDetailService.getGameById(gameId);

            if (!game) {
                res.status(404).json({ error: "Game niet gevonden" });
                return;
            }

            res.json(game);
        }
        catch (error) {
            console.error("Fout bij ophalen van game:", error);
            res.status(500).json({ error: "Kon games niet ophalen." });
        }
    }
}
