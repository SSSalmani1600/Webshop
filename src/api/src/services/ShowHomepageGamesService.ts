import { PoolConnection } from "mysql2/promise";
import { DatabaseService } from "./DatabaseService";
import { Game } from "@api/types/Game";

/**
 * Service voor het afhandelen van homepage games functionaliteit
 * Bevat de businesslogica voor het ophalen van uitgelichte games voor de homepage
 */
export class ShowHomepageGamesService {
    private readonly _databaseService: DatabaseService;

    public constructor() {
        this._databaseService = new DatabaseService();
    }

    /**
     * Haalt een beperkt aantal uitgelichte games op voor de homepage
     * Retourneert specifiek gekozen games voor de homepage
     *
     * @returns Een Promise met een array van Game objecten voor de homepage
     */
    public async getFeaturedGames(): Promise<Game[]> {
        const connection: PoolConnection = await this._databaseService.openConnection();

        try {
            // Haal specifieke games op die jij hebt gekozen
            const result: Game[] = await this._databaseService.query<Game[]>(
                connection,
                `
                SELECT *
                FROM games
                WHERE id = 17 OR id = 12 OR id = 26 OR id = 46 OR id = 3
                ORDER BY 
                    CASE id
                        WHEN 17 THEN 1
                        WHEN 12 THEN 2
                        WHEN 26 THEN 3
                        WHEN 46 THEN 4
                        WHEN 3 THEN 5
                    END
                `
            );

            return result;
        }
        catch (e: unknown) {
            // Als er een fout optreedt, gooi een nieuwe error met een beschrijvende message
            throw new Error(`Failed to retrieve featured games: ${e}`);
        }
        finally {
            // Zorg ervoor dat de database connectie wordt vrijgegeven naar de pool
            connection.release();
        }
    }
}
