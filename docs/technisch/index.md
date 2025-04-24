---
title: Technisch ontwerp
children:
---
# Technisch ontwerp
**TODO:** Werk op deze pagina het *Technisch ontwerp* van het team uit.

## ERD
![ERD](../img/ERD.png)

## UML Use case diagram
![UML](../img/UML%20case%20diagram.png)

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


