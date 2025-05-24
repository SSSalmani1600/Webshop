export class NavbarComponent {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback(): void {
        this.render();
        this.updateCartCount();
    }

    render(): void {
        this.shadowRoot!.innerHTML = `
        
        `
    }
}
