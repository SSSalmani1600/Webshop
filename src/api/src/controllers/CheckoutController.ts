import { Request, Response } from "express";
import { AddressService } from "@api/services/CheckoutService";

const addressService: AddressService = new AddressService();

export class AddressController {
    public async createAddress(req: Request, res: Response): Promise<void> {
        try {
            const { userId, naam, straatHuisnummer, postcodePlaats, telefoonnummer } = req.body as {
                userId: number;
                naam: string;
                straatHuisnummer: string;
                postcodePlaats: string;
                telefoonnummer: string;
            };

            // Validatie van verplichte velden
            if (!userId || !naam || !straatHuisnummer || !postcodePlaats || !telefoonnummer) {
                res.status(400).json({ error: "Alle velden zijn verplicht" });
                return;
            }

            const addressId: number = await addressService.createAddress(
                userId,
                naam,
                straatHuisnummer,
                postcodePlaats,
                telefoonnummer
            );

            res.status(201).json({ message: "Adres succesvol opgeslagen", addressId });
        } catch (error: unknown) {
            console.error(error);
            res.status(500).json({ error: "Kon adres niet opslaan" });
        }
    }
}
