import { DatabaseService } from "./DatabaseService";
import { RowDataPacket } from "mysql2";

interface UserData extends RowDataPacket {
    id: number;
    username: string;
    email: string;
    password: string;
    is_logged_in: number;
}

export class LoginService {
    private databaseService: DatabaseService;

    constructor() {
        this.databaseService = new DatabaseService();
    }

    public async validateUser(loginIdentifier: string, password: string): Promise<UserData | null> {
        const connection = await this.databaseService.openConnection();

        try {
            // Zoek de gebruiker op basis van gebruikersnaam OF e-mail
            const users: UserData[] = await this.databaseService.query<UserData[]>(
                connection,
                "SELECT * FROM `user` WHERE (username = ? OR email = ?) AND password = ? LIMIT 1",
                loginIdentifier,
                loginIdentifier,
                password
            );

            if (users && users.length > 0) {
                return users[0];
            }

            return null;
        } finally {
            connection.release();
        }
    }

    public async updateLoginStatus(userId: number, loggedIn: boolean): Promise<void> {
        const connection = await this.databaseService.openConnection();

        try {
            await this.databaseService.query(
                connection,
                "UPDATE `user` SET is_logged_in = ? WHERE id = ?",
                loggedIn ? 1 : 0,
                userId
            );
        } finally {
            connection.release();
        }
    }
} 
