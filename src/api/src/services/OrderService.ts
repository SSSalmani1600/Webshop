import { DatabaseService } from "./DatabaseService";
import { PoolConnection } from "mysql2";

export class OrderService {
    private readonly _db: DatabaseService = new DatabaseService();

    public async createOrder(
        sessionId: string,
        orderNumber: string,
        totalPrice: number
    ): Promise<number> {
        const connection: PoolConnection = await this._db.openConnection();
    }

}
