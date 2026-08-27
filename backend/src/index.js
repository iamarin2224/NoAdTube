import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Resolve .env relative to the backend directory so it works from root or backend cwd
dotenv.config({ path: path.resolve(__dirname, "../.env") });

import { app } from "./app.js";
import connectDB from "./db/index.js";

const PORT = process.env.PORT || 8000;

connectDB()
.then(() => {
    app.listen(PORT, () => {
        console.log(`Server is listening to ${PORT}`);
    });
})
.catch((err) => {
    console.log(`MongoDB connection error`, err);
});
