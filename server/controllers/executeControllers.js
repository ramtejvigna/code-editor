import fs from "fs";
import path from "path";
import { exec } from "child_process";
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
    },
    typescript: {
        extension: "ts",
        command: "npx ts-node main.ts"
    }
};

export const execution = (req, res) => {
    try {
        const { language, code, input } = req.body;
        
        if (!languages[language]) 
            return res.status(400).json({ error: "Unsupported language" });

        const extension = languages[language].extension;
        const fileName = `main.${extension}`;
        const filePath = path.join(CODE_DIR, fileName);
        const inputFilePath = path.join(CODE_DIR, "input.txt");
        const command = languages[language].command;

        // Write the code to a file
        fs.writeFileSync(filePath, code);
        
        // Write input to file if provided
        if (input && input.trim()) {
            fs.writeFileSync(inputFilePath, input);
        }

        // Create the command to execute with input redirection if necessary
        let dockerCmd;
        if (input && input.trim()) {
            dockerCmd = `docker run --rm -v ${CODE_DIR}:/sandbox code-sandbox bash -c "cd /sandbox && ${command} < input.txt"`;
        } else {
            dockerCmd = `docker run --rm -v ${CODE_DIR}:/sandbox code-sandbox bash -c "cd /sandbox && ${command}"`;
        }

        exec(dockerCmd, { timeout: 10000 }, (error, stdout, stderr) => {
            // Clean up files regardless of success or failure
            try {
                fs.unlinkSync(filePath);
                if (fs.existsSync(inputFilePath)) {
                    fs.unlinkSync(inputFilePath);
                }
                // Remove any compiled files
                if (language === 'cpp') {
                    const executablePath = path.join(CODE_DIR, "main");
                    if (fs.existsSync(executablePath)) {
                        fs.unlinkSync(executablePath);
                    }
                }
                if (language === 'java') {
                    const classFilePath = path.join(CODE_DIR, "Main.class");
                    if (fs.existsSync(classFilePath)) {
                        fs.unlinkSync(classFilePath);
                    }
                }
            } catch (cleanupError) {
                console.error("Error cleaning up files:", cleanupError);
            }

            // Handle execution results
            if (error) {
                if (error.killed) {
                    return res.status(408).json({ output: "Execution timed out after 10 seconds", err: error });
                }
                return res.status(500).json({ output: stderr || error.message });
            }
            
            res.json({ output: stdout });
        });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
};