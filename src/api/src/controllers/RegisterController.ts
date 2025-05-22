import { RegisterService } from "@api/services/RegisterService";
import { User } from "@api/types/User";
import { Request, Response } from "express";

export class RegisterController {
    private readonly _registerService: RegisterService = new RegisterService();

    public async addNewUser(req: Request, res: Response): Promise<void> {
        try {
            const user: User = req.body as User;

            if (!user.username || !user.email || !user.password) {
                res.status(400).json({ error: "Missing required fields" });
                return;
            }

            await this._registerService.addNewUser(user);
            res.status(201).json({ message: "User registered successfully" });
        }
        catch (error) {
            console.error("Fout bij aanmaken van user", error);
            res.status(500).json({ error: "Failed to register user." });
        }
    }
}
