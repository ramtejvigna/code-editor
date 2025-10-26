import express from "express"
import path from "path"
import cors from "cors"
import { fileURLToPath } from "url"
import fs from "fs"
import { exec } from "child_process"
import { promisify } from "util"
import executeRoutes from "./routes/executeRoutes.js"

const execAsync = promisify(exec);

const app = express();

app.use(cors({
    origin: ['http://localhost:80', 'http://localhost:3000', 'http://localhost:5173', 'https://code-editor-sigma-woad.vercel.app'],
    methods: ['GET', 'POST'],
    credentials: true
}));
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const CODE_DIR = path.join(__dirname, "code");

if(!fs.existsSync(CODE_DIR))
    fs.mkdirSync(CODE_DIR)

// Health check endpoint
app.get('/health', async (req, res) => {
    const healthCheck = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        dockerEnabled: process.env.USE_DOCKER === 'true',
        version: '1.0.0'
    };

    // Check Docker availability if enabled
    if (process.env.USE_DOCKER === 'true') {
        try {
            await execAsync("docker info", { timeout: 5000 });
            healthCheck.dockerStatus = 'available';
        } catch (error) {
            healthCheck.dockerStatus = 'unavailable';
            healthCheck.dockerError = error.message;
        }
    }
    
    res.status(200).json(healthCheck);
});

app.use('/api', executeRoutes);

app.listen(5000, () => {
    console.log(`Server running on port 5000`);
})