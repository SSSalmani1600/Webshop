// Zorg dat defineMetadata global beschikbaar is als het niet bestaat
(global as any).defineMetadata = function(key: string, value: any, target: any) {
    if (!target.__metadata) {
        target.__metadata = {};
    }
    target.__metadata[key] = value;
};

import "@hboictcloud/metadata";

import "dotenv/config";
import express, { Application } from "express"; 
import cors from "cors";
import cookieParser from "cookie-parser";
import "express-async-errors";
import { router } from "./routes";

// Maak Express applicatie
const app: Application = express();

// Configureer middleware
app.use(cors({
    origin: ["http://localhost:3000"], // Frontend origin
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Voeg statische bestanden toe
app.use(express.static("./wwwroot"));

// Routers toevoegen
app.use(router);

// Start server
const port: number = parseInt(process.env.PORT || "3001");
app.listen(port, () => {
    console.log(`API is running on http://localhost:${port}`);
});
