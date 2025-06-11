import { ISessionService } from "../interfaces/ISessionService";
import { IWelcomeService } from "../interfaces/IWelcomeService";
import { SessionService } from "../services/SessionService";
import { WelcomeService } from "../services/WelcomeService";
import { Request, Response } from "express";

/**
 * This controller demonstrates the use of sessions, cookies and Services.
 *
 * @remarks This class should be removed from the final product!
 */
export class WelcomeController {
    private readonly _welcomeService: IWelcomeService = new WelcomeService();
    private readonly _sessionService: ISessionService = new SessionService();

    public async getSession(req: Request, res: Response): Promise<void> {
        const sessionId: string | undefined = await this._sessionService.createSession((req as unknown as { userId?: number }).userId ?? 0);

        const username: string = (req as unknown as { username?: string }).username ?? "Anoniem";
        const userId: number = (req as unknown as { userId?: number }).userId ?? 0;

        res
            .cookie("session", sessionId)
            .json({
                sessionId,
                username,
                userId,
            });
    }

    public async deleteSession(req: Request, res: Response): Promise<void> {
        const result: boolean | undefined = await this._sessionService.deleteSession(
            (req as unknown as { sessionId: string }).sessionId
        );

        if (!result) {
            res.status(400).end();

            return;
        }

        res.status(204).end();
    }

    public async deleteExpiredSessions(_req: Request, res: Response): Promise<void> {
        await this._sessionService.deleteExpiredSessions();

        res.status(204).end();
    }

    public getWelcome(req: Request, res: Response): void {
        const result: string = this._welcomeService.getWelcomeText((req as unknown as { userId?: number }).userId);

        res.json({
            message: result,
        });
    }

    public getSecret(req: Request, res: Response): void {
        res.json({
            sessionId: (req as unknown as { sessionId?: string }).sessionId,
            userId: (req as unknown as { userId?: number }).userId,
        });
    }
}
