import { Request, Response } from "express";
import { NavbarService } from "@api/services/NavbarService";

export class NavbarController {
    private readonly _navbarService: NavbarService = new NavbarService();

    private getUserIdFromCookie(req: Request): number | null {
        const raw: unknown = req.cookies.user;
        const parsed: number = typeof raw === "string" ? parseInt(raw, 10) : NaN;
        return isNaN(parsed) ? null : parsed;
    }

    public async getCartCount(req: Request, res: Response): Promise<void> {
        const userId: number | null = this.getUserIdFromCookie(req);

        if (userId === null) {
            res.status(400).json({ count: 0 });
            return;
        }

        try {
            const count: number = await this._navbarService.getCartItemCount(userId);
            res.json({ count });
        }
        catch (error) {
            console.error("Fout bij ophalen van winkelmand teller:", error);
            res.status(500).json({ count: 0 });
        }
    }
}
