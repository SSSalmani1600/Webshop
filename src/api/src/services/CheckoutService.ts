import { DatabaseService } from "./DatabaseService";
import { PoolConnection, ResultSetHeader } from "mysql2/promise";

export class CheckoutService {
    private readonly _db: DatabaseService = new DatabaseService();

    public async createAddress(
        userId: number,
        naam: string,
        straatHuisnummer: string,
        postcodePlaats: string,
        telefoonnummer: string
    ): Promise<number> {
        const connection: PoolConnection = await this._db.openConnection();

        try {
            const result: ResultSetHeader = await this._db.query<ResultSetHeader>(
                connection,
                `
                INSERT INTO addresses (user_id, naam, straat_huisnummer, postcode_plaats, telefoonnummer)
                VALUES (?, ?, ?, ?, ?)
                `,
                userId,
                naam,
                straatHuisnummer,
                postcodePlaats,
                telefoonnummer
            );

            return result.insertId;
        }
        catch (e) {
            throw new Error(`Adres opslaan mislukt: ${e}`);
        }
        finally {
            connection.release();
        }
    }
}
