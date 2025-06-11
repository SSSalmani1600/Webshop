import { Request, Response } from "express";
import { ActionService } from "../services/ActionService";
import { Actie } from "../types/Actie";

export class ActionController {
    private readonly _actionService: ActionService = new ActionService();

    public async getActieByProductA(req: Request, res: Response): Promise<Response> {
        const productId: number = parseInt(req.params.productId, 10);

        try {
            const actie: Actie | null = await this._actionService.getActieByProductA(productId);

            if (!actie) {
                return res.status(404).json({ message: "Geen geldige actie gevonden." });
            }

            return res.json(actie);
        }
        catch (err) {
            console.error(err);
            return res.status(500).json({ message: "Fout bij ophalen actie." });
        }
    }
}
