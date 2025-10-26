import { exec } from "child_process";
import fs from "fs";
import path from "path";
import { promisify } from "util";
import { CODE_DIR } from "../server.js";

const execAsync = promisify(exec);

// Docker images for different languages
const dockerImages = {
    python: "python:3.11-alpine",
    java: "openjdk:11-alpine", 
    javascript: "node:18-alpine",
    typescript: "node:18-alpine",
    cpp: "gcc:latest"
};

// Language-specific execution commands within Docker
const dockerCommands = {
    python: "python3 /code/main.py",
    java: "cd /code && javac Main.java && java Main",
    javascript: "node /code/main.js", 
    typescript: "cd /code && npx ts-node main.ts",
    cpp: "cd /code && g++ -o main main.cpp && ./main"
};

export const executeInDocker = async (language, code, input = "") => {
    const startTime = Date.now();
    const containerId = `code-exec-${startTime}-${Math.random().toString(36).substr(2, 9)}`;
    
    try {
        // Check if Docker is available
        try {
            await execAsync("docker info", { timeout: 5000 });
        } catch (dockerCheckError) {
            console.error("Docker is not available:", dockerCheckError.message);
            throw new Error("Docker is not available. Please ensure Docker is running and accessible.");
        }

        // Validate language support
        if (!dockerImages[language] || !dockerCommands[language]) {
            throw new Error(`Unsupported language: ${language}`);
        }

        // Create a temporary directory for this execution
        const tempDir = path.join(CODE_DIR, containerId);
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }

        // Determine file extension and name
        const extensions = {
            python: "py",
            java: "java", 
            javascript: "js",
            typescript: "ts",
            cpp: "cpp"
        };

        let fileName = `main.${extensions[language]}`;
        let codeToWrite = code;

        // Special handling for Java - extract class name and adjust filename
        if (language === 'java') {
            const classNameMatch = code.match(/public\s+class\s+([A-Za-z0-9_]+)/);
            if (classNameMatch) {
                const className = classNameMatch[1];
                fileName = `${className}.java`;
                // Update the docker command to use the correct class name
                dockerCommands.java = `cd /code && javac ${className}.java && java ${className}`;
            } else {
                // Default to Main class if no public class found
                fileName = "Main.java";
                codeToWrite = code.replace(/class\s+\w+/, 'class Main');
            }
        }

        const filePath = path.join(tempDir, fileName);
        const inputPath = path.join(tempDir, "input.txt");

        // Write code and input files
        fs.writeFileSync(filePath, codeToWrite);
        if (input && input.trim()) {
            fs.writeFileSync(inputPath, input);
        }

        // Prepare Docker command
        const image = dockerImages[language];
        const command = dockerCommands[language];
        
        // Install TypeScript in container if needed
        let setupCommand = "";
        if (language === 'typescript') {
            setupCommand = "npm install -g typescript ts-node && ";
        }

        const dockerCmd = input && input.trim() 
            ? `docker run --rm -v "${tempDir}":/code -w /code --name ${containerId} --memory=128m --cpus=0.5 --network=none --read-only --tmpfs /tmp ${image} sh -c "${setupCommand}${command} < /code/input.txt"`
            : `docker run --rm -v "${tempDir}":/code -w /code --name ${containerId} --memory=128m --cpus=0.5 --network=none --read-only --tmpfs /tmp ${image} sh -c "${setupCommand}${command}"`;

        console.log(`Executing: ${dockerCmd}`);

        // Execute with timeout
        const { stdout, stderr } = await execAsync(dockerCmd, {
            timeout: 10000, // 10 second timeout
            maxBuffer: 1024 * 1024 // 1MB max output
        });

        return {
            success: true,
            output: stdout,
            error: stderr,
            executionTime: Date.now() - startTime
        };

    } catch (error) {
        console.error("Docker execution error:", error);
        
        let errorMessage = error.message;
        if (error.killed) {
            errorMessage = "Execution timed out after 10 seconds";
        } else if (error.code === 125) {
            errorMessage = "Docker container failed to start";
        } else if (error.code === 126) {
            errorMessage = "Docker command not executable";
        } else if (error.code === 127) {
            errorMessage = "Docker command not found";
        }

        return {
            success: false,
            output: "",
            error: errorMessage,
            executionTime: Date.now() - startTime
        };
    } finally {
        // Cleanup: Remove temporary directory
        try {
            const tempDir = path.join(CODE_DIR, containerId);
            if (fs.existsSync(tempDir)) {
                fs.rmSync(tempDir, { recursive: true, force: true });
            }
        } catch (cleanupError) {
            console.error("Cleanup error:", cleanupError);
        }

        // Cleanup: Force remove container if it still exists
        try {
            await execAsync(`docker rm -f ${containerId}`, { timeout: 5000 });
        } catch (removeError) {
            // Container might already be removed, ignore error
        }
    }
};