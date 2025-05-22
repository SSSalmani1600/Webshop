// Haalt Request en Response op van express
// Haalt service op die adres opslaat
import { Request, Response } from "express";
import { CheckoutService } from "@api/services/CheckoutService";

// Maakt nieuwe service aan om straks adres op te slaan
const checkoutService: CheckoutService = new CheckoutService();

// Controller regelt wat er gebeurt als iemand een adres verstuurt
export class CheckoutController {
    // Deze functie voert alles uit als iemand adres invult en opstuurt
    public async createAddress(req: Request, res: Response): Promise<void> {
        try {
            // Pakt data uit formulier van gebruiker
            const { userId, naam, straatHuisnummer, postcodePlaats, telefoonnummer } = req.body as {
                userId: number;
                naam: string;
                straatHuisnummer: string;
                postcodePlaats: string;
                telefoonnummer: string;
            };

            // Checkt of alles is ingevuld
            if (!userId || !naam || !straatHuisnummer || !postcodePlaats || !telefoonnummer) {
                res.status(400).json({ error: "Alle velden zijn verplicht" });
                return;
            }

            // Checkt of naam klopt alleen letters en spaties minimaal 2 tekens
            const naamRegex: RegExp = /^[A-Za-zÀ-ÿ\s]{2,}$/;
            if (!naamRegex.test(naam)) {
                res.status(400).json({ error: "Naam moet minimaal 2 letters bevatten en mag alleen letters en spaties bevatten" });
                return;
            }

            // Checkt of straat met huisnummer klopt bijv Hoofdstraat 12A
            const straatRegex: RegExp = /^[A-Za-zÀ-ÿ\s]+\s?\d+[A-Za-z]{0,2}$/;
            if (!straatRegex.test(straatHuisnummer) || straatHuisnummer.length < 3) {
                res.status(400).json({ error: "Straat en huisnummer moeten minimaal 3 tekens zijn en een geldig adres bevatten (bijv. Hoofdstraat 12A)" });
                return;
            }

            // Checkt of postcode met plaats klopt bijv 1234 AB Amsterdam
            const postcodeRegex: RegExp = /^\d{4}\s?[A-Z]{2}\s+.+$/;
            if (!postcodeRegex.test(postcodePlaats)) {
                res.status(400).json({ error: "Postcode en plaats moeten in het formaat '1234 AB Plaatsnaam' zijn" });
                return;
            }

            // Checkt of telefoonnummer 10 cijfers heeft met of zonder spaties of streepjes
            const telefoonRegex: RegExp = /^(?:\d{10}|\d{2}[-\s]?\d{8}|\d{3}[-\s]?\d{3}[-\s]?\d{4})$/;
            if (!telefoonRegex.test(telefoonnummer.replace(/\s|-/g, ""))) {
                res.status(400).json({ error: "Telefoonnummer moet bestaan uit 10 cijfers met of zonder streepjes of spaties" });
                return;
            }

            // Als alles klopt wordt adres opgeslagen via service
            const addressId: number = await checkoutService.createAddress(
                userId,
                naam,
                straatHuisnummer,
                postcodePlaats,
                telefoonnummer
            );

            // Geeft succes terug met ID van opgeslagen adres
            res.status(201).json({ message: "Adres succesvol opgeslagen", addressId });
        }
        catch (error: unknown) {
            // Als iets fout gaat laat foutmelding zien
            console.error(error);
            res.status(500).json({ error: "Kon adres niet opslaan" });
        }
    }
}
