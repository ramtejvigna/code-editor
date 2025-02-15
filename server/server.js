import express from "express"
import path from "path"
import cors from "cors"
import { fileURLToPath } from "url"
import fs from "fs"
import executeRoutes from "./routes/executeRoutes.js"

const app = express();

app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const CODE_DIR = path.join(__dirname, "code");

if(!fs.existsSync(CODE_DIR))
    fs.mkdirSync(CODE_DIR)


app.use('/', executeRoutes);

app.listen(5000, () => {
    console.log(`Server running on port 5000`);
})