import { PoolConnection } from "mysql2/promise";
import { DatabaseService } from "./DatabaseService";
import { Actie } from "@api/types/Actie";

export class ActionService {
    private readonly _databaseService: DatabaseService;

    public constructor(databaseService?: DatabaseService) {
        this._databaseService = databaseService ?? new DatabaseService();
    }

    public async getActieByProductA(productId: number): Promise<Actie | null> {
        const connection: PoolConnection = await this._databaseService.openConnection();
        const today: string = new Date().toISOString().split("T")[0];

        try {
            const result: Actie[] = await this._databaseService.query<Actie[]>(
                connection,
                `
                SELECT * FROM actions
                WHERE product_a_id = ?
                AND actief = 1
                AND ? BETWEEN start_datum AND eind_datum
                LIMIT 1
                `,
                productId,
                today
            );

            return result.length > 0 ? result[0] : null;
        }
        catch (e) {
            throw new Error(`Fout bij ophalen actie: ${e}`);
        }
        finally {
            connection.release();
        }
    }
}
