import { DatabaseService } from "./DatabaseService";
import { RowDataPacket } from "mysql2";
import { PoolConnection } from "mysql2/promise";

/**
 * Interface die de gebruikersgegevens definieert vanuit de database
 * Inclusief het veld is_logged_in dat gebruikt wordt voor de "onthoud mij" functionaliteit
 */
export interface UserData extends RowDataPacket {
    id: number;
    username: string;
    email: string;
    password: string;
    is_logged_in: number;
    is_admin: number;
}

/**
 * Service voor het afhandelen van authenticatie en login status
 * Bevat de businesslogica voor het valideren van gebruikers en het bijhouden van hun inlogstatus
 */
export class LoginService {
    private databaseService: DatabaseService;

    public constructor() {
        this.databaseService = new DatabaseService();
    }

    /**
     * Valideert de inloggegevens van een gebruiker
     *
     * @param loginIdentifier - De gebruikersnaam of e-mailadres
     * @param password - Het wachtwoord
     * @returns Een Promise met het gebruikersobject als de inloggegevens geldig zijn, anders null
     */
    public async validateUser(loginIdentifier: string, password: string): Promise<UserData | null> {
        const connection: PoolConnection = await this.databaseService.openConnection();

        try {
            // Zoek de gebruiker op basis van gebruikersnaam OF e-mail
            const users: UserData[] = await this.databaseService.query<UserData[]>(
                connection,
                "SELECT * FROM `user` WHERE (username = ? OR email = ?) AND password = ? LIMIT 1",
                loginIdentifier,
                loginIdentifier,
                password
            );

            if (users.length > 0) {
                return users[0];
            }

            return null;
        }
        finally {
            connection.release();
        }
    }

    /**
     * Werkt de inlogstatus van een gebruiker bij in de database
     * Deze methode wordt gebruikt om de "onthoud mij" functionaliteit te implementeren
     *
     * @param userId - De ID van de gebruiker
     * @param loggedIn - De gewenste inlogstatus (true voor ingelogd, false voor uitgelogd)
     */
    public async updateLoginStatus(userId: number, loggedIn: boolean): Promise<void> {
        const connection: PoolConnection = await this.databaseService.openConnection();

        try {
            await this.databaseService.query(
                connection,
                "UPDATE `user` SET is_logged_in = ? WHERE id = ?",
                loggedIn ? 1 : 0,
                userId
            );
        }
        finally {
            connection.release();
        }
    }

    /**
     * Haalt een gebruiker op uit de database op basis van ID
     *
     * @param userId - De ID van de gebruiker
     * @returns Een Promise met de gebruikersgegevens, of null als niet gevonden
     */
    public async getUserById(userId: number): Promise<UserData | null> {
        const connection: PoolConnection = await this.databaseService.openConnection();

        try {
            const users: UserData[] = await this.databaseService.query<UserData[]>(
                connection,
                "SELECT * FROM `user` WHERE id = ? LIMIT 1",
                userId
            );

            return users.length > 0 ? users[0] : null;
        }
        finally {
            connection.release();
        }
    }
}
