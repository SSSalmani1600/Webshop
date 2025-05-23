import { DatabaseService } from "./DatabaseService";
import { PoolConnection, ResultSetHeader } from "mysql2/promise";

//  service voor checkout
export class CheckoutService {
    // Maakt database-connectie klaar om later te gebruiken
    private readonly _db: DatabaseService = new DatabaseService();

    // Deze functie slaat adres op in database
    // Krijgt userId, naam, straat + huisnummer, postcode + plaats, telefoonnummer
    public async createAddress(
        userId: number,
        naam: string,
        straatHuisnummer: string,
        postcodePlaats: string,
        telefoonnummer: string
    ): Promise<number> {
        // Opent connectie met database (soort toegangspoort)
        const connection: PoolConnection = await this._db.openConnection();

        try {
            // Stuurt data naar database en voert SQL-query uit
            // Vraagtekens worden vervangen met data die je hierboven meegeeft
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

            // Geeft ID terug van nieuw adres dat net is opgeslagen
            return result.insertId;
        }
        catch (e) {
            // Als iets fout gaat, geef foutmelding terug
            throw new Error(`Adres opslaan mislukt: ${e}`);
        }
        finally {
            // Sluit connectie met database netjes af
            connection.release();
        }
    }
}
