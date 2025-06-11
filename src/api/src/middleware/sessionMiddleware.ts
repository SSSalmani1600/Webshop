import { ISessionService } from "@api/interfaces/ISessionService";
import { SessionService } from "@api/services/SessionService";
import { NextFunction, Request, Response } from "express";
import { LoginService } from "@api/services/LoginService";


const sessionService: ISessionService = new SessionService();
const loginService = new LoginService();


/**
 * Check if a session-header or session-cookie is available to optionally resolve the current User ID.
 */
export async function sessionMiddleware(req: Request, _res: Response, next: NextFunction): Promise<void> {
    const sessionIdHeader: string | undefined = req.headers["x-session"] as string;
    const sessionIdCookie: string | undefined = req.cookies["session"] as string;

    if (!sessionIdHeader && !sessionIdCookie) {
        next();

        return;
    }

    req.sessionId = sessionIdHeader || sessionIdCookie;

    const userId: number | undefined = await sessionService.getUserIdBySession(req.sessionId);

    req.userId = userId;

    if (userId) {
    const gebruiker = await loginService.getUserById(userId);
    if (gebruiker) {
        req.username = gebruiker.username;
    }
}


    next();
}

/**
 * Check if the User ID is actually set, otherwise the user has no permission (401).
 */
export function requireValidSessionMiddleware(req: Request, res: Response, next: NextFunction): void {
    if (!req.userId) {
        res.status(401).end();

        return;
    }

    next();
}
