import { Request, Response } from "express";
import { ForgotPasswordService } from "../services/ForgotPasswordService";

/**
 * Interface voor de forgot password request data
 */
interface ForgotPasswordRequest {
    email: string;
    newPassword: string;
}

/**
 * Controller voor het afhandelen van forgot password requests
 * Handelt wachtwoord reset functionaliteit af
 */
export class ForgotPasswordController {
    private forgotPasswordService: ForgotPasswordService;

    public constructor() {
        this.forgotPasswordService = new ForgotPasswordService();
    }

    /**
     * Handelt het forgot password request af
     * Valideert de gebruikersinvoer, reset het wachtwoord en stuurt een bevestigingsmail
     *
     * @param req - Het Express Request object met email en nieuw wachtwoord
     * @param res - Het Express Response object voor het terugsturen van de response
     */
    public async resetPassword(req: Request, res: Response): Promise<void> {
        try {
            const { email, newPassword }: ForgotPasswordRequest = req.body as ForgotPasswordRequest;

            // Validatie van input
            if (!email || !newPassword) {
                res.status(400).json({
                    success: false,
                    message: "E-mailadres en nieuw wachtwoord zijn verplicht",
                });
                return;
            }

            // Email validatie (basic)
            const emailRegex: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                res.status(400).json({
                    success: false,
                    message: "Ongeldig e-mailadres",
                });
                return;
            }

            // Wachtwoord lengte validatie
            if (newPassword.length < 4) {
                res.status(400).json({
                    success: false,
                    message: "Wachtwoord moet minimaal 4 karakters lang zijn",
                });
                return;
            }

            // Reset het wachtwoord via de service
            const result: { success: boolean; message: string } = await this.forgotPasswordService.resetPassword(
                email.toLowerCase().trim(),
                newPassword
            );

            if (!result.success) {
                res.status(400).json(result);
                return;
            }

            res.status(200).json(result);
        }
        catch (error) {
            console.error("Forgot password controller error:", error);
            res.status(500).json({
                success: false,
                message: "Er is een interne serverfout opgetreden",
            });
        }
    }
};
