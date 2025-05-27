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
     * Retourneert maximaal 5 games gesorteerd op ID (kan later aangepast worden naar andere criteria)
     *
     * @returns Een Promise met een array van Game objecten voor de homepage
     */
    public async getFeaturedGames(): Promise<Game[]> {
        const connection: PoolConnection = await this._databaseService.openConnection();

        try {
            // Haal de eerste 5 games op uit de database voor de homepage
            // Dit kan later uitgebreid worden met specifieke filtering voor "featured" games
            const result: Game[] = await this._databaseService.query<Game[]>(
                connection,
                `
                SELECT *
                FROM games
                ORDER BY id ASC
                LIMIT 5
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
