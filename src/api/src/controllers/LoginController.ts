import { Request, Response } from "express";
import { LoginService, UserData } from "../services/LoginService";

/**
 * Interface die de structuur van het login request definieert
 * Bevat de inloggegevens en "onthoud mij" voorkeur van de gebruiker
 */
interface LoginRequest {
    loginIdentifier: string;
    password: string;
    rememberMe?: boolean;
}

/**
 * Controller voor het afhandelen van login requests
 * Handelt authenticatie en "onthoud mij" functionaliteit af
 */
export class LoginController {
    private loginService: LoginService;

    public constructor() {
        this.loginService = new LoginService();
    }

    /**
     * Handelt het login request af
     * Valideert de gebruikersinvoer, controleert de inloggegevens en
     * implementeert de "onthoud mij" functionaliteit
     *
     * @param req - Het Express Request object met de inloggegevens
     * @param res - Het Express Response object voor het terugsturen van de response
     */
    public async login(req: Request, res: Response): Promise<void> {
        try {
            const { loginIdentifier, password, rememberMe }: LoginRequest = req.body as LoginRequest;

            // Valideer invoer
            if (!loginIdentifier || !password) {
                res.status(400).json({
                    success: false,
                    message: "Gebruikersnaam/e-mail en wachtwoord zijn verplicht",
                });
                return;
            }

            // Valideer login
            const user: UserData | null = await this.loginService.validateUser(loginIdentifier, password);

            if (!user) {
                res.status(401).json({
                    success: false,
                    message: "Ongeldige inloggegevens",
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
