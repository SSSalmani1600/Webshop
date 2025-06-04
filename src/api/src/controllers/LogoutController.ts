import { Request, Response } from "express";
import { LogoutService } from "@api/services/LogoutService";

export class LogoutController {
    private readonly _logoutService: LogoutService;

    public constructor() {
        this._logoutService = new LogoutService();
    }

    public async logout(req: Request, res: Response): Promise<void> {
        try {
            await this._logoutService.logout(req);
            res.status(200).json({ message: "Successfully logged out" });
        }
        catch (error: unknown) {
            console.error("Logout error:", error);
            res.status(500).json({ message: "Logout failed" });
        }
    }
}
