import { Request, Response } from "express";
import { GameDetailService } from "@api/services/ProductDetailService";
import { Game } from "@api/types/Game";


export class GameDetailService {
    private readonly _gameDetailService: GameDetailService = new GameDetailService();

    public async getGameById(req: Request, res: Response): Promise<void> {
        const gameId = req.query.id as string; 

        if (!gameId) {
           res.status(400).json({ error: "Game ID ontbreekt."})
           return;
        }

        try { 
            const game: Game | null = await this._gameDetailService.getGameById(gameId);

            if (!game) { 
                res.status(404).json({error: "Game niet gevonden"})
                return;               
            }
        }
    }
}
