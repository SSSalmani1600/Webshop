import { PoolConnection } from "mysql2/promise";
import { DatabaseService } from "./DatabaseService";
import { User } from "@api/types/User";

export class RegisterService {
    private readonly _databaseService: DatabaseService = new DatabaseService();

    public async addNewUser(user: User): Promise<void> {
        const connection: PoolConnection = await this._databaseService.openConnection();

        try {
            await this._databaseService.query(
                connection,
                `
                INSERT INTO user (username, email, password)
                VALUES (?)
                `,
                [user.username, user.email, user.password]
            );
        }
        catch (e: unknown) {
            throw new Error(`Failed to add user: ${e}`);
        }
        finally {
            connection.release();
        }
    }
}
