
import { CartSummaryComponent } from "../components/CheckoutproductComponent";
document.addEventListener("DOMContentLoaded", async () => {
  try {
    const summary = new CartSummaryComponent(".checkout-summary");
    await summary.render();
  } catch (error) {
    console.error("Fout bij laden van cart component:", error);
  }
});
