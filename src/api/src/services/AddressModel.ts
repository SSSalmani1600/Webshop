import { DatabaseService } from "./DatabaseService";

const databaseService = new DatabaseService();

export class AddressModel {
  static async saveAddress(
    userId: number,
    naam: string,
    straat: string,
    postcodePlaats: string,
    telefoonnummer: string
  ): Promise<void> {
    const connection = await databaseService.openConnection();

    try {
      const query = `
        INSERT INTO addresses (user_id, naam, straat_huisnummer, postcode_plaats, telefoonnummer)
        VALUES (?, ?, ?, ?, ?)
      `;

      await databaseService.query(connection, query, userId, naam, straat, postcodePlaats, telefoonnummer);
    } finally {
      connection.release();
    }
  }
}
