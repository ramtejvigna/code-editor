import fs from "fs"
import { exec } from "child_process"
import path from "path"
import { CODE_DIR } from "../server.js";

const languages = {
    python: {
        extension: "py",
        command: "python3 main.py",
    },
    java: {
        extension: "java",
        command: "javac Main.java && java Main",
    },
    javascript: {
        extension: "js",
        command: "node main.js",
    },
    cpp: {
        extension: "cpp",
        command: "g++ main.cpp -o main && ./main"
    }
}

export const execution = (req, res) => {
    try {
        const { language, code } = req.body;
        if(!languages[language]) 
            return res.status(400).json({ error: "Unsupported language" });

        const extension = languages[language].extension;
        const fileName = `main.${extension}`
        const filePath = path.join(CODE_DIR, fileName);
        const command = languages[language].command;

        fs.writeFileSync(filePath, code);

        const dockerCmd = `docker run --rm -v ${CODE_DIR}:/sandbox code-sandbox bash -c "cd /sandbox && ${command}"`;

        exec(dockerCmd, (error, stdout, stderr) => {
            if (error) return res.json({ output: stderr || error.message });
            res.json({ output: stdout });
        });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
}