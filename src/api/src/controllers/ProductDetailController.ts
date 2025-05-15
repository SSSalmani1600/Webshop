import { Request, Response } from "express";
import { GameDetailService } from "@api/services/ProductDetailService";
import { Game } from "@api/types/Game";

export class GameDetailService {
    private readonly _gameDetailService: GameDetailService = new GameDetailService();

    public async getGameById(req: Request, res: Response): Promise<void> {
        const gameId = req.query.id as string; 

        try {

        }
    }
}
