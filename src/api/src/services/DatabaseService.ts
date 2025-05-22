import { PoolConnection, Pool, createPool, Connection } from "mysql2/promise";

/**
 * Pool of database connections
 *
 * @remarks Purposely placed outside of the class below to treat the connection pool as a singleton
 */
let connectionPool: Pool | undefined;

/**
 * Get the connection pool
 *
 * @remarks Will initialize the connection pool the first time this function is called
 */
function getConnectionPool(): Pool {
    if (!connectionPool) {
        connectionPool = createPool({
            host: "db.hbo-ict.cloud",
            port: parseInt("3366" as string),
            database: "pb4sea2425_laajoowiicoo13_dev",
            user: "pb4sea2425_laajoowiicoo13",
            password: "OmzExntBc1EvPHn7",
            connectionLimit: parseInt("10" as string),
        });
    }

    return connectionPool;
}
/**
 * Service to communicate with a pre-configured database
 */
export class DatabaseService {
    /**
     * Opens a connection to a pre-configured database
     *
     * @remarks Do not forget to `release()` the connection when you are done with it
     *
     * @returns Connection to the database
     */
    public openConnection(): Promise<PoolConnection> {
        return getConnectionPool().getConnection();
    }

    /**
     * Use an existing connection to execute a query
     *
     * @template T Optional type to use for the query result, `unknown` if omitted.
     *
     * @param connection Connection to the database
     * @param query Query, optionally a prepared statement, to execute on the database.
     * @param values Optional values to use for the prepared statement
     *
     * @returns Query result of type {@link T}
     */
    public async query<T = unknown>(
        connection: Connection,
        query: string,
        ...values: unknown[]
    ): Promise<T> {
        const [queryResult] = await connection.query(query, values);

        return queryResult as T;
    }
}
