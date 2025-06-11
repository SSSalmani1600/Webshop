import { PoolConnection } from "mysql2/promise";
import { DatabaseService } from "./DatabaseService";

/**
 * Interface voor de user data uit de database
 */
interface UserData {
    id: number;
    username: string;
    email: string;
    password: string;
}

/**
 * Interface voor email response van HBO-ICT.Cloud API
 */
interface EmailResponse {
    message: string;
}

/**
 * Interface voor email data naar HBO-ICT.Cloud API
 */
interface EmailData {
    from: {
        name: string;
        address: string;
    };
    to: Array<{
        name: string;
        address: string;
    }>;
    subject: string;
    html: string;
}

/**
 * Service voor het afhandelen van forgot password functionaliteit
 * Bevat businesslogica voor wachtwoord reset en email verzending
 */
export class ForgotPasswordService {
    private databaseService: DatabaseService;

    public constructor() {
        this.databaseService = new DatabaseService();
    }

    /**
     * Reset het wachtwoord voor een gebruiker en stuur een bevestigingsmail
     *
     * @param email - Het e-mailadres van de gebruiker
     * @param newPassword - Het nieuwe wachtwoord
     * @returns Een promise die wordt resolved als het wachtwoord is gewijzigd
     */
    public async resetPassword(email: string, newPassword: string): Promise<{ success: boolean; message: string }> {
        const connection: PoolConnection = await this.databaseService.openConnection();

        try {
            // Controleer of de gebruiker bestaat
            const users: UserData[] = await this.databaseService.query<UserData[]>(
                connection,
                "SELECT id, username, email, password FROM `user` WHERE email = ? LIMIT 1",
                email
            );

            if (users.length === 0) {
                return {
                    success: false,
                    message: "Er is geen account met dit e-mailadres gevonden",
                };
            }

            const user: UserData = users[0];

            // Update het wachtwoord in de database
            await this.databaseService.query(
                connection,
                "UPDATE `user` SET password = ?, updated_at = NOW() WHERE email = ?",
                newPassword,
                email
            );

            // Stuur bevestigingsmail
            const emailSent: boolean = await this.sendPasswordResetConfirmationEmail(user.email, user.username);

            if (!emailSent) {
                // Wachtwoord is wel gewijzigd, maar mail versturen is mislukt
                return {
                    success: true,
                    message: "Wachtwoord succesvol gewijzigd. Let op: de bevestigingsmail kon niet worden verzonden.",
                };
            }

            return {
                success: true,
                message: "Wachtwoord succesvol gewijzigd! Er is een bevestigingsmail verzonden naar je e-mailadres.",
            };
        }
        catch (error) {
            console.error("Error in resetPassword:", error);
            return {
                success: false,
                message: "Er is een fout opgetreden bij het wijzigen van het wachtwoord. Probeer het later opnieuw.",
            };
        }
        finally {
            connection.release();
        }
    }

    /**
     * Stuur een bevestigingsmail naar de gebruiker
     *
     * @param email - Het e-mailadres van de gebruiker
     * @param username - De gebruikersnaam
     * @returns true als de mail succesvol is verzonden, false anders
     */
    private async sendPasswordResetConfirmationEmail(email: string, username: string): Promise<boolean> {
        try {
            const emailData: EmailData = {
                from: {
                    name: "LucaStars",
                    address: "noreply@lucabstars.nl",
                },
                to: [
                    {
                        name: username,
                        address: email,
                    },
                ],
                subject: "Wachtwoord succesvol gewijzigd - LucaStars",
                html: `
                    <h1>Wachtwoord gewijzigd</h1>
                    <p>Hallo ${username},</p>
                    <p>Je wachtwoord voor je LucaStars account is succesvol gewijzigd.</p>
                    <p>Als je deze wijziging niet hebt aangevraagd, neem dan onmiddellijk contact met ons op.</p>
                    <p>Met vriendelijke groet,<br/>Het LucaStars Team</p>
                `,
            };

            const response: Response = await fetch("https://api.hbo-ict.cloud/mail", {
                method: "POST",
                headers: {
                    "Authorization": "Bearer pb4sea2425_laajoowiicoo13.49OMv9eLc7g3BvQS",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(emailData),
            });

            if (!response.ok) {
                console.error("Email API error:", response.status, response.statusText);
                const errorText: string = await response.text();
                console.error("Email API error body:", errorText);
                return false;
            }

            const result: EmailResponse = await response.json() as EmailResponse;
            console.log("Email sent successfully:", result.message);
            return true;
        }
        catch (error) {
            console.error("Error sending password reset confirmation email:", error);
            return false;
        }
    }
};
