import fs from "fs";
import path from "path";
import { exec } from "child_process";
import { CODE_DIR } from "../server.js";

const languages = {
    python: {
        extension: "py",
        command: "python3",
    },
    java: {
        extension: "java",
        command: "javac",
        runCommand: "java"
    },
    javascript: {
        extension: "js",
        command: "node",
    },
    cpp: {
        extension: "cpp",
        command: "g++ main.cpp -o main && ./main"
    },
    typescript: {
        extension: "ts",
        command: "npx ts-node"
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

        // Create CODE_DIR if it doesn't exist
        if (!fs.existsSync(CODE_DIR)) {
            fs.mkdirSync(CODE_DIR, { recursive: true });
        }

        // Write the code to a file
        fs.writeFileSync(filePath, code);
        
        // Write input to file if provided
        if (input && input.trim()) {
            fs.writeFileSync(inputFilePath, input);
        }

        // Execute the code directly instead of using docker
        let cmd;
        
        // Handle Java specially
        if (language === 'java') {
            // For Java, need to extract class name from file
            const javaCode = fs.readFileSync(filePath, 'utf8');
            const classNameMatch = javaCode.match(/public\s+class\s+([A-Za-z0-9_]+)/);
            const className = classNameMatch ? classNameMatch[1] : 'Main';
            
            // Save the file with the correct class name
            fs.renameSync(filePath, path.join(CODE_DIR, `${className}.java`));
            
            // Compile and run with the correct class name
            cmd = input && input.trim() 
                ? `cd ${CODE_DIR} && javac ${className}.java && java ${className} < input.txt`
                : `cd ${CODE_DIR} && javac ${className}.java && java ${className}`;
                
        } else if (language === 'python' || language === 'javascript' || language === 'typescript') {
            // For interpreted languages, run the interpreter with the file
            const interpreter = languages[language].command;
            cmd = input && input.trim() 
                ? `cd ${CODE_DIR} && ${interpreter} ${fileName} < input.txt`
                : `cd ${CODE_DIR} && ${interpreter} ${fileName}`;
        } else {
            // For compiled languages or languages with multi-step commands
            cmd = input && input.trim()
                ? `cd ${CODE_DIR} && ${languages[language].command} < input.txt`
                : `cd ${CODE_DIR} && ${languages[language].command}`;
        }

        exec(cmd, { timeout: 10000 }, (error, stdout, stderr) => {
            // Clean up files regardless of success or failure
            try {
                // Clean up input file
                if (fs.existsSync(inputFilePath)) {
                    fs.unlinkSync(inputFilePath);
                }
                
                // Clean up based on language
                if (language === 'java') {
                    // For Java, need to clean up both source and class files with proper class name
                    const javaCode = code;
                    const classNameMatch = javaCode.match(/public\s+class\s+([A-Za-z0-9_]+)/);
                    const className = classNameMatch ? classNameMatch[1] : 'Main';
                    
                    // Remove Java source file
                    const javaFilePath = path.join(CODE_DIR, `${className}.java`);
                    if (fs.existsSync(javaFilePath)) {
                        fs.unlinkSync(javaFilePath);
                    }
                    
                    // Remove Java class file
                    const classFilePath = path.join(CODE_DIR, `${className}.class`);
                    if (fs.existsSync(classFilePath)) {
                        fs.unlinkSync(classFilePath);
                    }
                } else if (language === 'cpp') {
                    // Remove source file
                    if (fs.existsSync(filePath)) {
                        fs.unlinkSync(filePath);
                    }
                    
                    // Remove compiled executable
                    const executablePath = path.join(CODE_DIR, "main");
                    if (fs.existsSync(executablePath)) {
                        fs.unlinkSync(executablePath);
                    }
                } else {
                    // For other languages, just remove the source file
                    if (fs.existsSync(filePath)) {
                        fs.unlinkSync(filePath);
                    }
                }
            } catch (cleanupError) {
                console.error("Error cleaning up files:", cleanupError);
            }

            // Handle execution results
            if (error) {
                if (error.killed) {
                    return res.status(408).json({ output: "Execution timed out after 10 seconds", err: error.message });
                }
                return res.status(500).json({ output: stderr || error.message });
            }
            
            res.json({ output: stdout });
        });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
};