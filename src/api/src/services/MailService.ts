export class MailService {
    private readonly apiKey = "pb4sea2425_viisaasaaqoo12.XCjXOHq2rOZZrav7";

    public async sendOrderConfirmation(
        toName: string,
        toEmail: string,
        orderNumber: string,
        games: string[],
        total: number
    ): Promise<void> {
        const html: string = `
            <h2>Bedankt voor je bestelling, ${toName}!</h2>
            <p>Je hebt de volgende games gekocht:</p>
            <ul>${games.map(g => `<li>${g}</li>`).join("")}</ul>
            <p><strong>Totaal:</strong> €${total.toFixed(2)}</p>
            <p>Ordernummer: <strong>${orderNumber}</strong></p>
            <p>Met vriendelijke groet,<br>LucaStars</p>
        `;

        await this.sendMail(toName, toEmail, `Bestelbevestiging #${orderNumber}`, html);
    }
}
