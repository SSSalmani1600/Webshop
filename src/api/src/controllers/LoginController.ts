import { Request, Response } from "express";
import { LoginService, UserData } from "../services/LoginService";
import { SessionService } from "../services/SessionService";

interface LoginRequest {
    loginIdentifier: string;
    password: string;
    rememberMe?: boolean;
}

export class LoginController {
    private loginService: LoginService;
    private sessionService: SessionService;

    public constructor() {
        this.loginService = new LoginService();
        this.sessionService = new SessionService();
    }

    public async login(req: Request, res: Response): Promise<void> {
        try {
            const { loginIdentifier, password, rememberMe }: LoginRequest = req.body as LoginRequest;

            if (!loginIdentifier || !password) {
                res.status(400).json({
                    success: false,
                    message: "Gebruikersnaam/e-mail en wachtwoord zijn verplicht",
                });
                return;
            }

            const user: UserData | null = await this.loginService.validateUser(loginIdentifier, password);

            if (!user) {
                res.status(401).json({
                    success: false,
                    message: "Ongeldige inloggegevens",
                });
                return;
            }

            if (rememberMe) {
                await this.loginService.updateLoginStatus(user.id, true);
            }

            const sessionId: string | undefined = await this.sessionService.createSession(user.id);

            if (!sessionId) {
                res.status(500).json({
                    success: false,
                    message: "Kon geen sessie aanmaken",
                });
                return;
            }

            res.cookie("session", sessionId, {
                httpOnly: false,
                secure: false,
                sameSite: "lax",
                maxAge: 60 * 60 * 1000,
            });

            res.cookie("user", user.id.toString(), {
                httpOnly: false,
                secure: false,
                sameSite: "lax",
                maxAge: 60 * 60 * 1000,
            });

            res.status(200).json({
                success: true,
                message: "Succesvol ingelogd",
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                },
                sessionId,
            });
        }
        catch (error) {
            console.error("Login error:", error);
            res.status(500).json({
                success: false,
                message: "Er is een fout opgetreden bij het inloggen",
            });
        }
    }
}
