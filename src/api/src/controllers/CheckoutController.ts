import { Request, Response } from "express";
import { CheckoutService } from "@api/services/CheckoutService";

const checkoutService: CheckoutService = new CheckoutService();

export class CheckoutController {
    public async createAddress(req: Request, res: Response): Promise<void> {
        try {
            const { userId, naam, straatHuisnummer, postcodePlaats, telefoonnummer } = req.body as {
                userId: number;
                naam: string;
                straatHuisnummer: string;
                postcodePlaats: string;
                telefoonnummer: string;
            };

            // Controle op verplichte velden
            if (!userId || !naam || !straatHuisnummer || !postcodePlaats || !telefoonnummer) {
                res.status(400).json({ error: "Alle velden zijn verplicht" });
                return;
            }

            // Validatie: Naam (alleen letters/spaties, minimaal 2 tekens)
            const naamRegex = /^[A-Za-zÀ-ÿ\s]{2,}$/;
            if (!naamRegex.test(naam)) {
                res.status(400).json({ error: "Naam moet minimaal 2 letters bevatten en mag alleen letters en spaties bevatten" });
                return;
            }

            // Validatie: Straat + Huisnummer (minimaal 3 tekens, letters en cijfers toegestaan)
            const straatRegex = /^[A-Za-zÀ-ÿ\s]+\s?\d+[A-Za-z]{0,2}$/;
            if (!straatRegex.test(straatHuisnummer) || straatHuisnummer.length < 3) {
                res.status(400).json({ error: "Straat en huisnummer moeten minimaal 3 tekens zijn en een geldig adres bevatten (bijv. Hoofdstraat 12A)" });
                return;
            }

            // Validatie: Postcode + Plaats (bv. 1234 AB Amsterdam)
            const postcodeRegex = /^\d{4}\s?[A-Z]{2}\s+.+$/;
            if (!postcodeRegex.test(postcodePlaats)) {
                res.status(400).json({ error: "Postcode en plaats moeten in het formaat '1234 AB Plaatsnaam' zijn" });
                return;
            }

            // Validatie: Telefoonnummer (exact 10 cijfers, met of zonder spaties/streepjes)
            const telefoonRegex = /^(?:\d{10}|\d{2}[-\s]?\d{8}|\d{3}[-\s]?\d{3}[-\s]?\d{4})$/;
            if (!telefoonRegex.test(telefoonnummer.replace(/\s|-/g, ""))) {
                res.status(400).json({ error: "Telefoonnummer moet bestaan uit 10 cijfers, met of zonder streepjes/spaties" });
                return;
            }

            // Alles OK – doorgaan met opslaan
            const addressId: number = await checkoutService.createAddress(
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
