import { Request, Response } from "express";
import { WelcomeUserService, UserWelcomeData } from "../services/WelcomeUserService";

/**
 * Interface voor de welcome API response
 */
interface WelcomeUserResponse {
    success: boolean;
    message: string;
    isLoggedIn: boolean;
    username?: string;
}

/**
 * Controller voor het afhandelen van welkomstbericht requests
 * Handelt het ophalen van gepersonaliseerde welkomstberichten af
 */
export class WelcomeUserController {
    private readonly _welcomeUserService: WelcomeUserService;

    public constructor() {
        this._welcomeUserService = new WelcomeUserService();
    }

    /**
     * Handelt het request af voor het ophalen van een welkomstbericht
     * Controleert of gebruiker is ingelogd en genereert gepersonaliseerd bericht
     *
     * @param req - Het Express Request object (met mogelijk userId uit sessie)
     * @param res - Het Express Response object voor het terugsturen van de response
     */
    public async getWelcomeMessage(req: Request, res: Response): Promise<void> {
        try {
            let welcomeMessage: string;
            let isLoggedIn: boolean = false;
            let username: string | undefined;

            // Check of gebruiker is ingelogd via sessie
            if (req.userId) {
                // Gebruiker is ingelogd, haal gebruikersdata op
                const user: UserWelcomeData | null = await this._welcomeUserService.getUserById(req.userId);
                welcomeMessage = this._welcomeUserService.generateWelcomeMessage(user);
                isLoggedIn = true;
                username = user?.username;
            }
            else {
                // Gebruiker is niet ingelogd, standaard welkomstbericht
                welcomeMessage = this._welcomeUserService.generateWelcomeMessage(null);
                isLoggedIn = false;
            }

            const response: WelcomeUserResponse = {
                success: true,
                message: welcomeMessage,
                isLoggedIn: isLoggedIn,
                username: username,
            };

            res.status(200).json(response);
        }
        catch (error) {
            console.error("Fout bij ophalen van welkomstbericht:", error);
            res.status(500).json({
                success: false,
                message: "Er is een fout opgetreden bij het ophalen van het welkomstbericht",
                isLoggedIn: false,
            });
        }
    }
};
