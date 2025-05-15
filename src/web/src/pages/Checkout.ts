import { CartSummaryComponent } from "../components/CheckoutproductComponent";

function initCheckoutFormStorage(): void {
  const FORM_KEY = "checkoutFormData";

  const formInputs = document.querySelectorAll<HTMLInputElement | HTMLSelectElement>(
    "input[type='text'], input[type='email'], input[type='radio'], select"
  );

  // Herstel eerder opgeslagen formulierdata
  const saved = localStorage.getItem(FORM_KEY);
  if (saved) {
    const data = JSON.parse(saved);
    formInputs.forEach((input) => {
      const name = input.name;
      if (!name) return;

      if (input.type === "radio") {
        input.checked = input.value === data[name];
        if (input.checked) input.dispatchEvent(new Event("click")); // toon juiste velden
      } else {
        input.value = data[name] || "";
      }
    });
  }

  // Opslaan bij wijziging
  formInputs.forEach((input) => {
    input.addEventListener("change", () => {
      const updatedData: Record<string, string> = {};
      formInputs.forEach((i) => {
        if (!i.name) return;
        if (i.type === "radio") {
          if ((i as HTMLInputElement).checked) {
            updatedData[i.name] = i.value;
          }
        } else {
          updatedData[i.name] = i.value;
        }
      });
      localStorage.setItem(FORM_KEY, JSON.stringify(updatedData));
    });
  });
}

function initOrderSubmission(): void {
  const button = document.getElementById("place-order");
  if (!button) return;

  button.addEventListener("click", async () => {
    const formInputs = document.querySelectorAll<HTMLInputElement | HTMLSelectElement>(
      "input[type='text'], input[type='email'], input[type='radio'], select"
    );

    const orderData: Record<string, string> = {};
    formInputs.forEach((input) => {
      if (!input.name) return;
      if (input.type === "radio") {
        if ((input as HTMLInputElement).checked) {
          orderData[input.name] = input.value;
        }
      } else {
        orderData[input.name] = input.value;
      }
    });

    try {
      const res = await fetch("http://localhost:3001/checkout/submit", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      if (!res.ok) throw new Error("Bestelling verzenden mislukt");

      alert("Bestelling succesvol geplaatst!");
      localStorage.removeItem("checkoutFormData");
    } catch (err) {
      console.error("Fout bij verzenden bestelling:", err);
      alert("Er is iets misgegaan bij het plaatsen van je bestelling.");
    }
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const summary = new CartSummaryComponent(".checkout-summary");
    await summary.render();

    initCheckoutFormStorage();
    initOrderSubmission();
  } catch (error) {
    console.error("Fout bij laden van cart component:", error);
    console.error("Fout bij laden van checkout:", error);
  }
});
