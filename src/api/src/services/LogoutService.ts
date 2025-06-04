import { Request } from "express";
import { ISessionService } from "../interfaces/ISessionService";
import { SessionService } from "./SessionService";

export class LogoutService {
    private readonly _sessionService: ISessionService;

    public constructor() {
        this._sessionService = new SessionService();
    }

    public async logout(req: Request): Promise<void> {
        // sessie verwijderen
        if (req.sessionId) {
            await this._sessionService.deleteSession(req.sessionId);
        }

        // cookies verwijderen
        if (req.res) {
            req.res.clearCookie("session");
            req.res.clearCookie("user");
        }
    }
}
