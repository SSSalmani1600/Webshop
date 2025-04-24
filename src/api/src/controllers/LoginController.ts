import { Request, Response } from "express";
import { LoginService } from "../services/LoginService";

interface LoginRequest {
    loginIdentifier: string;
    password: string;
    rememberMe?: boolean;
}

export class LoginController {
    private loginService: LoginService;

    constructor() {
        this.loginService = new LoginService();
    }

    public async login(req: Request, res: Response): Promise<void> {
        try {
            const { loginIdentifier, password, rememberMe }: LoginRequest = req.body as LoginRequest;

            // Valideer invoer
            if (!loginIdentifier || !password) {
                res.status(400).json({
                    success: false,
                    message: "Gebruikersnaam/e-mail en wachtwoord zijn verplicht"
                });
                return;
            }

            // Valideer login
            const user = await this.loginService.validateUser(loginIdentifier, password);

            if (!user) {
                res.status(401).json({
                    success: false,
                    message: "Ongeldige inloggegevens"
                });
                return;
            }

            // Update login status als 'remember me' is aangevinkt
            if (rememberMe) {
                await this.loginService.updateLoginStatus(user.id, true);
            }

            // Stuur sessie-ID terug
            const sessionId: string = req.headers["x-session"] as string;

            res.status(200).json({
                success: true,
                message: "Succesvol ingelogd",
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email
                },
                sessionId
            });
        } catch (error) {
            console.error("Login error:", error);
            res.status(500).json({
                success: false,
                message: "Er is een fout opgetreden bij het inloggen"
            });
        }
    }
} 