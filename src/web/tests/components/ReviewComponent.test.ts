import { describe, test, expect, beforeEach, vi } from "vitest";
import { GameDetailComponent } from "../../src/components/ProductDetailComponent";

// Mock voor fetch en PostreviewApiService
global.fetch = vi.fn();

describe("GameDetailComponent", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    vi.resetAllMocks();
  });

  test("should show warning if review or rating is missing", async () => {
    const component = new GameDetailComponent();
    document.body.appendChild(component);

    // Shadow DOM opzetten
    component.attachShadow({ mode: "open" });
    component.shadowRoot!.innerHTML = `
      <textarea id="review-input"></textarea>
      <div id="star-rating">
        <span data-value="1">☆</span>
        <span data-value="2">☆</span>
        <span data-value="3">☆</span>
        <span data-value="4">☆</span>
        <span data-value="5">☆</span>
      </div>
      <button id="submit-review">Plaatsen</button>
      <div id="review-status"></div>
    `;

    const reviewInput = component.shadowRoot!.querySelector("#review-input") as HTMLTextAreaElement;
    const submitButton = component.shadowRoot!.querySelector("#submit-review") as HTMLButtonElement;
    const reviewStatus = component.shadowRoot!.querySelector("#review-status") as HTMLElement;

    reviewInput.value = ""; // geen tekst
    submitButton.click(); // geen ster geselecteerd

    // kleine delay om eventuele async gedrag toe te staan
    await new Promise((r) => setTimeout(r, 100));

    expect(reviewStatus.textContent).toBe("Vul een review én een waardering in.");
    expect(reviewStatus.style.color).toBe("red");
  });

  test("should reset review input after submitting", async () => {
    // Mock fetch voor sessie en review plaatsen
    (fetch as unknown as vi.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        sessionId: "sessie123",
        username: "tester",
        userId: 99,
      }),
    });

    const component = new GameDetailComponent();
    document.body.appendChild(component);

    // Shadow DOM opzetten
    component.attachShadow({ mode: "open" });
    component.shadowRoot!.innerHTML = `
      <textarea id="review-input"></textarea>
      <div id="star-rating">
        <span data-value="1">☆</span>
        <span data-value="2">☆</span>
        <span data-value="3">☆</span>
        <span data-value="4">☆</span>
        <span data-value="5">☆</span>
      </div>
      <button id="submit-review">Plaatsen</button>
      <div id="review-status"></div>
    `;

    const reviewInput = component.shadowRoot!.querySelector("#review-input") as HTMLTextAreaElement;
    const stars = component.shadowRoot!.querySelectorAll<HTMLSpanElement>("#star-rating span");
    const submitButton = component.shadowRoot!.querySelector("#submit-review") as HTMLButtonElement;
    const reviewStatus = component.shadowRoot!.querySelector("#review-status") as HTMLElement;

    reviewInput.value = "Leuke game!";
    stars[4].dispatchEvent(new Event("click")); // geef 5 sterren
    submitButton.click();

    await new Promise((r) => setTimeout(r, 200)); // kleine wachttijd voor async

    expect(reviewInput.value).toBe("");
    expect(reviewStatus.textContent).toBe("Review geplaatst.");
    expect(reviewStatus.style.color).toBe("lightgreen");
  });
});
