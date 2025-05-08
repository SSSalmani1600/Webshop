
// Eerst zeggen we hoe een winkelwagen-item eruitziet.
interface CartItem {
    id: number;            
    game_id: number;       
    quantity: number;       
    price: string;          
    title: string;          
    thumbnail: string;      
  }
  
  // Dit is de class (soort bouwplan) die alles regelt voor de samenvatting.
  export class CartSummaryComponent {
    private container: HTMLElement; // Hier slaan we op waar op de webpagina we de inhoud willen tonen
  
    constructor(containerSelector: string) {
      // Hier zoeken naar stukje HTML waar we alles willen plaatsen
      const container = document.querySelector(containerSelector);
      if (!container) throw new Error(`Container ${containerSelector} niet gevonden`);
      this.container = container; 
    }
  
    // Deze functie zorgt ervoor dat de inhoud op het scherm komt
    async render(): Promise<void> {
      const cartItems = await this.fetchCartItems(); // Eerst halen we de producten op
      this.container.innerHTML = ""; 
  
      // Als niks in de winkelwagen zit:
      if (cartItems.length === 0) {
        this.container.innerHTML = "<p>Je winkelwagen is leeg.</p>";
        return; 
      }
  
      let totaal = 0; // Begin met een totaalbedrag van nul
  
      // Voor elk item in de winkelwagen:
      cartItems.forEach((item) => {
        const prijs = parseFloat(item.price); // Zet prijs om naar getal
        const totaalItem = prijs * item.quantity; // Bereken prijs × aantal
        totaal += totaalItem; // Tel op bij totaal
  
        // Maak een stukje HTML dat het item laat zien
        const div = document.createElement("div");
        div.className = "summary-item";
        div.innerHTML = `
          <div>
            <img src="${item.thumbnail}" alt="${item.title}" width="50" height="50" />
            <p>${item.title}</p>
            <p>€${totaalItem.toFixed(2)}</p>
          </div>
        `;
        this.container.appendChild(div); // Voeg het toe aan de pagina
      });
  
      const hr = document.createElement("hr");
        this.container.appendChild(hr);
      }
    }



