## Endpoint overzicht

## 📌 Endpoint: `GET /products`

### ✅ Wat doet het endpoint?
Het `/products` endpoint haalt een lijst op van alle beschikbare games.  
Deze worden gebruikt om de producten weer te geven in de frontend.

### 🔁 Type verzoek
`GET`

### 📥 Ontvangen data

#### Headers:
- `x-session` _(string)_: Een geldige sessie-ID die wordt meegegeven voor authenticatie of sessiebeheer.

### 📤 Teruggegeven data
Het endpoint retourneert een array van **Game-objecten**. Elk object bevat o.a.:

```json
[
  {
        "id": 1,
        "title": "Galaga Pay2Leave",
        "thumbnail": "https://lucastars.hbo-ict.cloud/media/d8aa96b742ac403ea8e3e3479ea8445c/00000006000000000000000000000000.png",
        "descriptionMarkdown": "Stel je voor: je zit vast in een arcadehal zonder geld voor een taxi naar huis. De enige manier om geld te verdienen is door arcadegames te spelen. In onze text-based adventure game, gemaakt door Game Studio LucaStars, begint je in de lobby en gaat naar de arcadehal met drie automaten. Elke game heeft zijn eigen uitdagingen en limieten. Door puzzels op te lossen en items te verzamelen, kun je de games repareren en genoeg coins verdienen om de taxi naar huis te betalen. Zodra je €20 hebt, is het spel afgelopen.",
        "descriptionHtml": "<p>Stel je voor: je zit vast in een arcadehal zonder geld voor een taxi naar huis. De enige manier om geld te verdienen is door arcadegames te spelen. In onze text-based adventure game, gemaakt door Game Studio LucaStars, begint je in de lobby en gaat naar de arcadehal met drie automaten. Elke game heeft zijn eigen uitdagingen en limieten. Door puzzels op te lossen en items te verzamelen, kun je de games repareren en genoeg coins verdienen om de taxi naar huis te betalen. Zodra je €20 hebt, is het spel afgelopen.</p>",
        "url": "https://coopeekuurii76-pb3seb2425.hbo-ict.cloud/",
        "images": null,
        "authors": "Xavi,Max,Kaan,Tim",
        "tags": "OUT B"
    },
]
```

---

## 📌 Endpoint: `GET /api/productprices/:gameId`

### ✅ Wat doet het endpoint?
Het `/api/productprices/:gameId` endpoint haalt de prijsinformatie op van een specifieke game, op basis van het opgegeven `gameId`.

### 🔁 Type verzoek
`GET`

### 📥 Ontvangen data

#### URL Parameter:
- `:gameId` _(string of number)_: Het ID van de game waarvan de prijs opgehaald moet worden.

#### Headers:
- `x-session` _(string)_: Een geldige sessie-ID die wordt meegegeven voor authenticatie of sessiebeheer.

### 📤 Teruggegeven data
Het endpoint retourneert een array met één of meerdere **GamePrices-objecten**. Elk object bevat o.a.:

```json
[
  {
        "price": 39.99,
        "productId": "1",
        "currency": "EURO",
        "validUntil": "2025-04-24T12:27:33.050+00:00"
    }
]
```
---

# 📌 Endpoint: POST /discount/apply

### ✅ Wat doet het endpoint?
Het /discount/apply endpoint controleert of een opgegeven kortingscode geldig is en retourneert het kortingspercentage als de code geldig is.

### 🔁 Type verzoek
`POST`

### 📥 Ontvangen data

````json
{
    "code": "TEST123"
}
````

### 📤 Teruggegeven data
Het endpoint retourneert een DiscountResponse-object met de volgende structuur:

````json
{
    "success": true,
    "valid": true,
    "discountPercentage": 15,
    "code": "TEST123"
}
````

Als de code ongeldig is of er een fout optreedt:

````json
{
    "success": false,
    "valid": false,
    "message": "Ongeldige kortingscode"
}
````

# 📌 Endpoint: GET /cart

### ✅ Wat doet het endpoint?
Het /cart endpoint haalt alle items op die in de winkelwagen van de ingelogde gebruiker zitten, inclusief totaalprijzen en eventuele kortingen.

### 🔁 Type verzoek
`GET`

### 📥 Ontvangen data

### Query Parameters:
`discountCode` (string, optioneel): Een kortingscode die moet worden toegepast op het totaalbedrag

### 📤 Teruggegeven data
Het endpoint retourneert een CartResponse-object met de volgende structuur:

````json
{
    "cart": [
        {
            "id": 1,
            "game_id": 123,
            "quantity": 2,
            "price": 29.99,
            "title": "Game Title",
            "thumbnail": "https://example.com/image.jpg"
        }
    ],
    "subtotal": 59.98,
    "total": 50.98,
    "discountPercentage": 15
}
````

---

# 📌 Endpoint: DELETE /cart/item/:id

### ✅ Wat doet het endpoint?
Het /cart/item/:id endpoint verwijdert een specifiek item uit de winkelwagen van de ingelogde gebruiker.'

### 🔁 Type verzoek

`DELETE`

### 📥 Ontvangen data
URL Parameters `:id` (number): Het ID van het winkelwagen-item dat verwijderd moet worden

### 📤 Teruggegeven data
Het endpoint retourneert een lege response met status code 204 bij succes.

---

# 📌 Endpoint: GET /wishlist

### ✅ Wat doet het endpoint?
Het /wishlist endpoint haalt alle items op die op de verlanglijst van de ingelogde gebruiker staan.

### 🔁 Type verzoek
`GET`

### 📥 Ontvangen data

### Headers:
x-session (string): Een geldige sessie-ID die wordt meegegeven voor authenticatie of sessiebeheer.

### 📤 Teruggegeven data
Het endpoint retourneert een array van wishlist items:

````json
[
    {
        "id": 1,
        "game_id": 123,
        "title": "Game Title",
        "thumbnail": "https://example.com/image.jpg",
        "price": 29.99
    }
]
````

---

# 📌 Endpoint: POST /wishlist/add

### ✅ Wat doet het endpoint?
Het `/wishlist/add` endpoint voegt een game toe aan de verlanglijst van de ingelogde gebruiker.

### 🔁 Type verzoek
`POST`

### 📥 Ontvangen data

````json
{
    "game_id": 123
}
````

### Headers:
`x-session` (string): Een geldige sessie-ID die wordt meegegeven voor authenticatie of sessiebeheer.

### 📤 Teruggegeven data
Het endpoint retourneert het toegevoegde item:

````json
{
    "id": 1,
    "game_id": 123,
    "user_id": 456
}
````

---

# 📌 Endpoint: DELETE /wishlist/:id

### ✅ Wat doet het endpoint?
Het `/wishlist/:id` endpoint verwijdert een specifiek item van de verlanglijst van de ingelogde gebruiker.

### 🔁 Type verzoek
`DELETE`

### 📥 Ontvangen data

### URL Parameters:
`:id` (number): Het ID van het verlanglijst-item dat verwijderd moet worden

### Headers:
`x-session` (string): Een geldige sessie-ID die wordt meegegeven voor authenticatie of sessiebeheer.

### 📤 Teruggegeven data
Het endpoint retourneert een lege response met status code 204 bij succes.
