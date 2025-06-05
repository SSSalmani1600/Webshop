import { PoolConnection } from "mysql2/promise";
import { DatabaseService } from "./DatabaseService";

/**
 * Interface voor gebruikersdata uit de database
 */
export interface UserWelcomeData {
    id: number;
    username: string;
    email: string;
}

/**
 * Service voor het ophalen van gebruikersinformatie voor welkomstberichten
 * Handelt de communicatie met de database af voor gebruikersgegevens
 */
export class WelcomeUserService {
    private readonly _databaseService: DatabaseService;

    public constructor() {
        this._databaseService = new DatabaseService();
    }

    /**
     * Haalt gebruikersinformatie op via gebruikers-ID
     * @param userId - Het ID van de gebruiker
     * @returns Een Promise met gebruikersdata of null als niet gevonden
     */
    public async getUserById(userId: number): Promise<UserWelcomeData | null> {
        const connection: PoolConnection = await this._databaseService.openConnection();

        try {
            const users: UserWelcomeData[] = await this._databaseService.query<UserWelcomeData[]>(
                connection,
                "SELECT id, username, email FROM `user` WHERE id = ? LIMIT 1",
                userId
            );

            if (users.length > 0) {
                return users[0];
            }

            return null;
        }
        catch (e: unknown) {
            throw new Error(`Failed to retrieve user data: ${e}`);
        }
        finally {
            connection.release();
        }
    }

    /**
     * Genereert een welkomstbericht op basis van gebruikersdata
     * @param user - De gebruikersdata of null voor standaardbericht
     * @returns Een welkomstbericht string
     */
    public generateWelcomeMessage(user: UserWelcomeData | null): string {
        if (user && user.username) {
            return `Welkom terug, ${user.username}!`;
        }

        return "Welkom bij LucaStars!";
    }
};
