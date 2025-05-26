import { ReviewService } from "@web/services/PostReviewService";
import type { ReviewRequestBody } from "@web/interfaces/IReviewService";
export class ReviewForm extends HTMLElement {
    private gameId!: number;
    private reviewService = new ReviewService();
    public constructor() {
        super();
        this.attachShadow({ mode: "open" });
    }

    public connectedCallback(): void {
        const url: URL = new URL(window.location.href);
        const idParam: string | null = url.searchParams.get("id");
        if (!idParam || isNaN(Number(idParam))) {
            console.error("Invalid or missing game ID in the URL.");
            return;
        }
        this.gameId = Number(idParam);
        this.render();
        this.addEventListeners();
    }

    private render(): void {
        if (!this.shadowRoot) return;
        this.shadowRoot.innerHTML = `
        <style>
            :host {
                display: flex;
                justify-content: center;
                width: 100%;
                margin: 2rem 0;
                font-family: 'Inter', sans-serif;
            }
            .card {
                background-color: #1A1C24;
                padding: 2rem;
                border-radius: 1rem;
                box-shadow: 0 0 10px rgba(0,0,0,0.3);
                color: #ffffff;
                max-width: 500px;
                width: 100%;
            }
            h3 {
                font-size: 1.25rem;
                margin-bottom: 1rem;
                color: #fff;
            }
            form {
                display: flex;
                flex-direction: column;
                gap: 1rem;
            }
            label {
                display: flex;
                flex-direction: column;
                font-size: 0.9rem;
                color: #ccc;
            }
            textarea {
                background-color: #0B0E15;
                border: 1px solid #2A2D3A;
                border-radius: 0.5rem;
                padding: 0.75rem;
                color: #fff;
                font-size: 0.9rem;
                outline: none;
                resize: vertical;
                transition: border-color 0.2s;
            }
            textarea:focus {
                border-color: #FF6600;
            }
            button {
                background-color: #FF6600;
                color: #fff;
                border: none;
                padding: 0.75rem 1rem;
                border-radius: 0.5rem;
                cursor: pointer;
                font-weight: 600;
                font-size: 0.95rem;
                transition: background-color 0.2s;
            }
            button:hover {
                background-color: #e65c00;
            }
            .error {
                color: #f87171;
                font-size: 0.9rem;
            }
            .success {
                color: green;
                font-size: 0.9rem;
            }
            .emoji-rating {
                display: flex;
                gap: 0.5rem;
                font-size: 2rem;
                justify-content: center;
                cursor: pointer;
            }
            .emoji-rating span {
                transition: transform 0.2s;
            }
            .emoji-rating span:hover {
                transform: scale(1.2);
            }
            .emoji-rating .selected {
                border-bottom: 2px solid #FF6600;
                border-radius: 4px;
            }
        </style>
        <div class="card">
            <h3>Leave a review</h3>
            <form id="reviewForm">
                <label>
                    Rating:
                    <div class="emoji-rating" id="emojiRating">
                        <span data-value="1">😠</span>
                        <span data-value="2">😕</span>
                        <span data-value="3">😐</span>
                        <span data-value="4">🙂</span>
                        <span data-value="5">🤩</span>
                    </div>
                </label>
                <input type="hidden" id="rating" required />
                <label>
                    Comment (optional):
                    <textarea id="comment" rows="4" placeholder="What did you think of the game?"></textarea>
                </label>
                <button type="submit">Submit review</button>
                <div id="message"></div>
            </form>
        </div>
    `;
    }

    private addEventListeners(): void {
        const form: HTMLFormElement = this.shadowRoot?.querySelector("#reviewForm") as HTMLFormElement;
        const ratingInput: HTMLInputElement = this.shadowRoot?.querySelector("#rating") as HTMLInputElement;
        const commentInput: HTMLTextAreaElement = this.shadowRoot?.querySelector("#comment") as HTMLTextAreaElement;
        const messageDiv: HTMLDivElement = this.shadowRoot?.querySelector("#message") as HTMLDivElement;
        const emojiContainer: HTMLElement = this.shadowRoot?.querySelector("#emojiRating") as HTMLElement;
        // Emoji click logic
        emojiContainer.querySelectorAll("span").forEach(emoji => {
            emoji.addEventListener("click", () => {
                emojiContainer.querySelectorAll("span").forEach(e => e.classList.remove("selected"));
                emoji.classList.add("selected");
                ratingInput.value = emoji.getAttribute("data-value") ?? "";
            });
        });
        form.addEventListener("submit", async (e: SubmitEvent): Promise<void> => {
            e.preventDefault();
            const ratingValue: number = Number(ratingInput.value);
            if (!ratingValue || ratingValue < 1 || ratingValue > 5) {
                messageDiv.textContent = "Please select a rating.";
                messageDiv.className = "error";
                return;
            }
            const review: ReviewRequestBody = {
                rating: ratingValue,
                comment: commentInput.value.trim(),
            };
            try {
                await this.reviewService.postReview(this.gameId, review);
                // Show success message
                messageDiv.textContent = "Review successfully posted.";
                messageDiv.className = "success";
                form.reset();
                emojiContainer.querySelectorAll("span").forEach(e => e.classList.remove("selected"));
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            }
            catch (error) {
                console.error("Error posting review:", error);
                messageDiv.textContent = "Something went wrong. Please try again.";
                messageDiv.className = "error";
            }
        });
    }
}
customElements.define("review-form", ReviewForm);
