import type { Game } from "@api/types/Game";
import type { ReviewRequestBody } from "@web/interfaces/IReviewService";
import { PostreviewApiService } from "@web/services/PostreviewApiService";
import "@web/components/AddToWishlistComponent";

interface SessionData {
  sessionId: string;
  username: string;
}

interface Review {
  id: number;
  rating: number;
  comment: string;
  username: string;
}

export class GameDetailComponent extends HTMLElement {
  private shadow: ShadowRoot;
  private editingReviewId: number | null = null;
  private editingReviewText = "";
  private currentUsername = "";

  public constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });
  }

  public connectedCallback(): void {
    this.renderLoading();
    void this.loadGame();
  }

  private renderLoading(): void {
    this.shadow.innerHTML = "<p style=\"color: white;\">Game wordt geladen...</p>";
  }

  private async loadGame(): Promise<void> {
    const urlParams = new URLSearchParams(window.location.search);
    const gameId = urlParams.get("id");

    if (!gameId) {
      this.shadow.innerHTML = "<p style=\"color: red;\">Geen game ID opgegeven.</p>";
      return;
    }

    try {
      const { sessionId, username } = await this.getSession();
      this.currentUsername = username;
      const response = await fetch(`${VITE_API_URL}game?id=${gameId}`, {
        headers: { "x-session": sessionId },
      });

      if (!response.ok) throw new Error("Kon game niet ophalen.");

      const game = (await response.json()) as Game;
      this.renderGame(game, parseInt(gameId, 10));
    } catch (error) {
      this.shadow.innerHTML = `<p style=\"color: red;\">Fout: ${(error as Error).message}</p>`;
    }
  }

  private async getSession(): Promise<SessionData> {
    const res = await fetch(`${VITE_API_URL}session`, { credentials: "include" });
    const data = await res.json();

      console.log("📦 getSession() response:", data); // 🔥 HIER TOEVOEGEN


    if (
      typeof data === "object" &&
      data !== null &&
      "sessionId" in data &&
      "username" in data &&
      typeof data.sessionId === "string" &&
      typeof data.username === "string"
    ) {
      return data as SessionData;
    }

    throw new Error("Invalid session object");
  }

  private renderGame(game: Game, gameId: number): void {
    this.shadow.innerHTML = `
      <div class="box" style="max-width: 1500px; margin: 0 auto 20px auto;">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <h2><br><strong>${game.title}</strong></h2>
          <add-to-wishlist game-id="${gameId}"></add-to-wishlist>
        </div>
        <img src="${game.thumbnail}" alt="${game.title}" />
      </div>

      <div class="info-boxes">
        <div class="box">
          <h3>Description</h3>
          ${game.descriptionHtml}
        </div>
        <div class="box">
          <h3>Reviews:</h3>
          <div id="reviews-output"></div>

          <textarea id="review-input" rows="4" placeholder="Schrijf hier je review..."
            style="width: 100%; padding: 10px; border-radius: 8px; resize: vertical; margin-bottom: 10px;"></textarea>

          <div id="star-rating" style="margin-bottom: 10px; font-size: 24px; color: gray; cursor: pointer;">
            <span data-value="1">☆</span>
            <span data-value="2">☆</span>
            <span data-value="3">☆</span>
            <span data-value="4">☆</span>
            <span data-value="5">☆</span>
          </div>

          <button id="submit-review" style="padding: 10px 20px; border-radius: 999px; background-color: #7f41f5; color: white; border: none; cursor: pointer;">Plaatsen</button>
          <div id="review-status" style="margin-top: 10px; color: lightgreen;"></div>
        </div>
      </div>
    `;

    const reviewService = new PostreviewApiService();
    const reviewButton = this.shadow.querySelector<HTMLButtonElement>("#submit-review");
    const reviewInput = this.shadow.querySelector<HTMLTextAreaElement>("#review-input");
    const reviewStatus = this.shadow.querySelector<HTMLDivElement>("#review-status");
    let selectedRating = 0;
    const stars = this.shadow.querySelectorAll<HTMLSpanElement>("#star-rating span");

    stars.forEach((star) => {
      star.addEventListener("click", () => {
        selectedRating = parseInt(star.dataset.value ?? "0", 10);
        stars.forEach((s, index) => {
          s.textContent = index < selectedRating ? "★" : "☆";
          s.style.color = index < selectedRating ? "gold" : "gray";
        });
      });
    });

    reviewButton?.addEventListener("click", async () => {
      const comment = reviewInput?.value.trim();
      if (!comment || selectedRating < 1) {
        if (reviewStatus) {
          reviewStatus.textContent = "Vul een review én een waardering in.";
          reviewStatus.style.color = "red";
        }
        return;
      }

      const body: ReviewRequestBody = {
        userId: 1,
        rating: selectedRating,
        comment,
        username: this.currentUsername,
      };

      await reviewService.postReview(gameId, body);

      if (reviewStatus) {
        reviewStatus.textContent = "Review geplaatst.";
        reviewStatus.style.color = "lightgreen";
      }

      if (reviewInput) reviewInput.value = "";
      selectedRating = 0;

      stars.forEach((s) => {
        s.textContent = "☆";
        s.style.color = "gray";
      });

      await this.loadReviews(gameId);
      this.setupReviewEditing(gameId);
    });

    void this.loadReviews(gameId).then(() => this.setupReviewEditing(gameId));
  }

  private async loadReviews(gameId: number): Promise<void> {
    const output = this.shadow.querySelector<HTMLElement>("#reviews-output");
    if (!output) return;

    try {
      const res = await fetch(`${VITE_API_URL}api/games/${gameId}/reviews`, { credentials: "include" });
      const reviews = (await res.json()) as Review[];

      output.innerHTML = reviews
  .map((r) => {
    console.log("⚠️ Vergelijking:", `"${r.username}"`, "vs", `"${this.currentUsername}"`);

    const canEdit = r.username?.trim().toLowerCase() === this.currentUsername.trim().toLowerCase();

    console.log("✅ canEdit =", canEdit);

    if (this.editingReviewId === r.id && canEdit) {
      return `
        <div style="margin-bottom: 10px;">
          <strong style="color: #fff;">${r.username}</strong><br/>
          <textarea id="edit-textarea" style="width:100%; height:60px;">${this.editingReviewText}</textarea><br/>
          <button id="save-edit">Opslaan</button>
          <button id="cancel-edit">Annuleren</button>
        </div>
      `;
    }

    return `
      <div style="margin-bottom: 10px;">
        <strong style="color: #fff;">${r.username}</strong><br/>
        <span style="color: gold; font-size: 16px;">
          ${"★".repeat(r.rating)}${"☆".repeat(5 - r.rating)}
        </span><br/>
        <span style="color: #ccc; font-size: 14px;">${r.comment}</span><br/>
        ${canEdit ? `<button class="edit-btn" data-review-id="${r.id}" data-comment="${r.comment}">✏️ Bewerken</button>` : ""}
      </div>
    `;
  })
  .join("");

    } catch {
      output.innerHTML = "<p style='color:red;'>Kon reviews niet ophalen.</p>";
    }
  }

  private setupReviewEditing(gameId: number): void {
    const output = this.shadow.querySelector("#reviews-output");
    if (!output) return;

    output.addEventListener("click", async (e) => {
      const target = e.target as HTMLElement;

      if (target.classList.contains("edit-btn")) {
        const reviewId = parseInt(target.dataset.reviewId ?? "0", 10);
        const comment = target.dataset.comment ?? "";
        this.editingReviewId = reviewId;
        this.editingReviewText = comment;
        await this.loadReviews(gameId);
      }

      if (target.id === "cancel-edit") {
        this.editingReviewId = null;
        this.editingReviewText = "";
        await this.loadReviews(gameId);
      }

      if (target.id === "save-edit") {
        const textarea = this.shadow.querySelector<HTMLTextAreaElement>("#edit-textarea");
        const newComment = textarea?.value.trim();
        if (newComment && this.editingReviewId) {
          await fetch(`${VITE_API_URL}api/reviews/${this.editingReviewId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ comment: newComment }),
          });
        }
        this.editingReviewId = null;
        this.editingReviewText = "";
        await this.loadReviews(gameId);
      }
    });
  }
}

customElements.define("game-detail-page", GameDetailComponent);
