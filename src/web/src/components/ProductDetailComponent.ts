export class GameDetailComponent extends HTMLElement {
    private shadow: ShadowRoot;

    public constructor() {
        super();
        this.shadow = this.attachShadow({ mode: "open" });
    }

    public connectedCallback(): void {
        this.renderLoading();
        this.loadGame();
    }

    private renderLoading(): void {
        this.shadow.innerHTML = "<p style=\"color: white;\">Game wordt geladen...</p>";
    }

    private async loadGame(): Promise<void> {
        const urlParams = new URLSearchParams(window.location.search);
        const gameId: string | null = urlParams.get("id");

        if (!gameId) {
            this.shadow.innerHTML = "<p style=\"color: red;\">Geen game ID opgegeven.</p>";
            return;
        }

        try {
            const response = await fetch(`/api/game?id=${gameId}`);
            if (!response.ok) throw new Error("Kon game niet ophalen.");

            const game = await response.json();
            this.renderGame(game);
        }
        catch (error) {
            this.shadow.innerHTML = `<p style="color: red;">Fout: ${(error as Error).message}</p>`;
        }
    }

    private renderGame(game: {
        title: string;
        thumbnail: string;
        descriptionHtml: string;
        price?: number | null;
    }): void {
        const price = game.price !== undefined && game.price !== null ? `$${game.price}` : "N/B";


