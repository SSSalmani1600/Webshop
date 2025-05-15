import { Request, Response } from "express";
import { AddressModel } from "../services/AddressModel";

export class AddressController {
  static async postAddress(req: Request, res: Response): Promise<void> {
    const { naam, straat_huisnummer, postcode_plaats, telefoonnummer } = req.body;
    const userId = req.session?.userId;

    if (!userId) {
      res.status(401).json({ error: "Niet ingelogd" });
      return;
    }

    try {
      await AddressModel.saveAddress(userId, naam, straat_huisnummer, postcode_plaats, telefoonnummer);
      res.status(200).json({ message: "Adres succesvol opgeslagen." });
    } catch (error) {
      console.error("Fout bij opslaan adres:", error);
      res.status(500).json({ error: "Interne serverfout" });
    }
  }
}
