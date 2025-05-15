import { Request, Response } from "express";
import { AddressModel } from "../services/AddressModel";

export class AddressController {
  static async postAddress(req: Request, res: Response): Promise<void> {
    const { naam, straat_huisnummer, postcode_plaats, telefoonnummer } = req.body;

    const userId = req.session?.userId;

    if (!userId) {
      console.warn("❌ Geen userId in sessie aanwezig");
      res.status(401).json({ error: "Niet ingelogd" });
      return;
    }

    console.log("📩 Adres opslaan voor userId:", userId);

    try {
      await AddressModel.saveAddress(userId, naam, straat_huisnummer, postcode_plaats, telefoonnummer);
      console.log("✅ Adres succesvol opgeslagen!");
      res.redirect("/"); // of res.redirect("/bedankt.html")
    } catch (error) {
      console.error("❌ Fout bij opslaan adres:", error);
      res.status(500).json({ error: "Interne serverfout" });
    }
  }
}
