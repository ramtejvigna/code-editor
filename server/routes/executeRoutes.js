import express from "express"
import { execution } from "../controllers/executeControllers.js";

const router = express.Router();

router.post('/execute', execution);


export default router;