// Zorg dat defineMetadata global beschikbaar is als het niet bestaat
interface MetadataTarget {
    __metadata?: Record<string, unknown>;
}

(global as { defineMetadata?: (key: string, value: unknown, target: MetadataTarget) => void }).defineMetadata =
function (key: string, value: unknown, target: MetadataTarget) {
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
import session from "express-session"; // ✅ toegevoegde regel
import "express-async-errors";
import { router } from "./routes";

// Maak Express applicatie
const app: Application = express();

// Configureer middleware
app.use(cors({
    credentials: true,
    origin(requestOrigin, callback) {
        callback(null, requestOrigin);
    },
}));

app.use(express.json());
app.use(cookieParser());

// ✅ Toegevoegde sessieconfiguratie
app.use(session({
    secret: "geheime_sleutel",
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,        // want je werkt lokaal zonder HTTPS
        httpOnly: true,
        sameSite: "lax"
    }
}));

// Voeg statische bestanden toe
app.use(express.static("./wwwroot"));

// Routers toevoegen
app.use(router);

// Start server
const port: number = parseInt(process.env.PORT || "3001");
app.listen(port, () => {
    console.log(`API is running on http://localhost:${port}`);
});
