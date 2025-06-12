export class MailService {
    private readonly apiKey = "pb4sea2425_viisaasaaqoo12.XCjXOHq2rOZZrav7";

    public async sendOrderConfirmation(
        toName: string,
        toEmail: string,
        orderNumber: number,
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

    private async sendMail(toName: string, toEmail: string, subject: string, html: string): Promise<void> {
        const response: Response = await fetch("https://api.hbo-ict.cloud/mail", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${this.apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                from: {
                    name: "laajoowiicoo13",
                    address: "noreply@hbo-ict.cloud",
                },
                to: [
                    {
                        name: toName,
                        address: toEmail,
                    },
                ],
                subject,
                html,
            }),
        });

        if (!response.ok) {
            const error: string = await response.text();
            throw new Error("Mail verzenden mislukt: " + error);
        }

        console.log(`✅ Mail verzonden naar ${toEmail}`);
    }
}
