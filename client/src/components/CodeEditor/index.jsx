import { useState, useEffect } from "react"
import Editor from "@monaco-editor/react"
import {
  Play,
  Settings,
  Terminal,
  Code2,
  Save,
  Copy,
  ChevronDown,
  RotateCcw,
  Monitor,
  Clock,
  Zap,
  Braces,
  FileCode,
  Cpu,
} from "lucide-react"
import axios from "axios"

const CodeEditor = () => {
  const [code, setCode] = useState('// Write your code here\nprint("Hello, World!")')
  const [input, setInput] = useState("")
  const [output, setOutput] = useState("")
  const [language, setLanguage] = useState("python")
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false)
  const [theme, setTheme] = useState("vs-dark")
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [fontSize, setFontSize] = useState(14)
  const [isLoading, setIsLoading] = useState(false)
  const [lastSaved, setLastSaved] = useState(new Date())
  const [editorInstance, setEditorInstance] = useState(null)

  const handleEditorChange = (value) => {
    setCode(value)
  }

  const handleInputChange = (e) => {
    setInput(e.target.value)
  }

  const runCode = async () => {
    setIsLoading(true)
    setOutput("Running...")
    try {
      const response = await axios.post("http://localhost:5000/execute", {
        language,
        code,
        input,
      })
      setOutput(response.data.output)
    } catch (error) {
      setOutput(`Error: ${error.response?.data?.error || error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  // Function to handle editor mounting
  const handleEditorDidMount = (editor, monaco) => {
    setEditorInstance(editor)

    // Add Ctrl+Enter keyboard shortcut
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, runCode)
  }

  // Add global keyboard event listener for Ctrl+Enter as a fallback
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        runCode()
        e.preventDefault()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [code, language, input])

  const languages = [
    {
      value: "javascript",
      extension: "js",
      label: "JavaScript",
      icon: "⚡",
      code: 'console.log("Hello World");\n\n// To read input, use process.stdin\n// Example:\n/*\nprocess.stdin.on("data", data => {\n  const input = data.toString().trim();\n  console.log(`You entered: ${input}`);\n});\n*/',
    },
    {
      value: "typescript",
      extension: "ts",
      label: "TypeScript",
      icon: "📘",
      code: 'console.log("Hello World");\n\n// To read input, use process.stdin\n// Example:\n/*\nprocess.stdin.on("data", data => {\n  const input = data.toString().trim();\n  console.log(`You entered: ${input}`);\n});\n*/',
    },
    {
      value: "python",
      extension: "py",
      label: "Python",
      icon: "🐍",
      code: 'print("Hello World!")\n\n# To read input, use input() function\n# Example:\n"""\ninput_value = input()\nprint(f"You entered: {input_value}")\n"""',
    },
    {
      value: "cpp",
      extension: "cpp",
      label: "C++",
      icon: "⚙️",
      code: '#include<iostream>\nusing namespace std;\n\nint main() {\n\tcout << "Hello World" << endl;\n\t\n\t// To read input\n\t// Example:\n\t/*\n\tstring input;\n\tgetline(cin, input);\n\tcout << "You entered: " << input << endl;\n\t*/\n\treturn 0;\n}',
    },
    {
      value: "java",
      extension: "java",
      label: "Java",
      icon: "☕",
      code: 'import java.util.Scanner;\n\npublic class Main {\n\tpublic static void main(String[] args) {\n\t\tSystem.out.println("Hello World");\n\t\t\n\t\t// To read input\n\t\t// Example:\n\t\t/*\n\t\tScanner scanner = new Scanner(System.in);\n\t\tString input = scanner.nextLine();\n\t\tSystem.out.println("You entered: " + input);\n\t\t*/\n\t}\n}',
    },
  ]

  const saveCode = () => {
    setLastSaved(new Date())
    // Add save animation
    const saveButton = document.getElementById("saveButton")
    saveButton.classList.add("animate-ping")
    setTimeout(() => saveButton.classList.remove("animate-ping"), 1000)
  }

  const copyCode = () => {
    navigator.clipboard.writeText(code)
    // Add copy animation
    const copyButton = document.getElementById("copyButton")
    copyButton.classList.add("scale-110")
    setTimeout(() => copyButton.classList.remove("scale-110"), 200)
  }

  const resetCode = () => {
    const tempCode = languages.find((lang) => lang.value === language)?.code
    setCode(tempCode)
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 font-mono">
      {/* Top Navigation Bar */}
      <div className="border-b border-slate-700 bg-[#1e293b] p-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500 p-1.5 rounded-md">
              <Braces className="w-5 h-5 text-[#0f172a]" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 text-transparent bg-clip-text">
              DevSphere IDE
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-[#0f172a] px-3 py-1.5 rounded-full text-xs">
              <Clock className="w-4 h-4 text-emerald-400" />
              <span className="text-slate-300">{lastSaved.toLocaleTimeString()}</span>
            </div>
            <div className="flex items-center gap-2 bg-[#0f172a] px-3 py-1.5 rounded-full text-xs">
              <Cpu className="w-4 h-4 text-emerald-400" />
              <span className="text-slate-300">Ready</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Toolbar */}
        <div className="mb-6 flex items-center justify-between bg-[#1e293b] p-3 rounded-xl shadow-lg border border-slate-700">
          <div className="flex items-center gap-3">
            {/* Language Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-[#0f172a] rounded-lg hover:bg-slate-800 transition-colors border border-slate-700"
              >
                <FileCode className="w-4 h-4 text-emerald-400" />
                {languages.find((lang) => lang.value === language)?.label}
                <div className={`transition-all ${isLanguageDropdownOpen && "rotate-180"}`}>
                  <ChevronDown className="w-4 h-4" />
                </div>
              </button>

              {isLanguageDropdownOpen && (
                <div className="absolute z-10 mt-1 w-48 bg-[#1e293b] rounded-lg shadow-xl border border-slate-700 animate-fadeIn">
                  <ul className="py-1">
                    {languages.map((lang) => (
                      <li
                        key={lang.value}
                        onClick={() => {
                          setLanguage(lang.value)
                          setIsLanguageDropdownOpen(false)
                          setCode(lang.code)
                        }}
                        className="flex items-center gap-2 px-4 py-2 hover:bg-[#0f172a] cursor-pointer"
                      >
                        <span>{lang.icon}</span>
                        {lang.label}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex bg-[#0f172a] rounded-lg border border-slate-700 divide-x divide-slate-700">
              <button id="saveButton" onClick={saveCode} className="p-2 hover:bg-slate-800 transition-all" title="Save">
                <Save className="w-4 h-4 text-emerald-400" />
              </button>
              <button id="copyButton" onClick={copyCode} className="p-2 hover:bg-slate-800 transition-all" title="Copy">
                <Copy className="w-4 h-4 text-emerald-400" />
              </button>
              <button className="p-2 hover:bg-slate-800 transition-all" title="Reset" onClick={resetCode}>
                <RotateCcw className="w-4 h-4 text-emerald-400" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setTheme(theme === "vs-dark" ? "light" : "vs-dark")}
              className="p-2 bg-[#0f172a] hover:bg-slate-800 rounded-lg transition-all border border-slate-700"
              title="Toggle Theme"
            >
              <Monitor className="w-4 h-4 text-emerald-400" />
            </button>
            <button
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className="p-2 bg-[#0f172a] hover:bg-slate-800 rounded-lg transition-all border border-slate-700"
              title="Settings"
            >
              <Settings className="w-4 h-4 text-emerald-400" />
            </button>
            <button
              onClick={runCode}
              className={`flex items-center gap-2 px-6 py-2 bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors ${isLoading ? "animate-pulse" : ""}`}
              title="Run (Ctrl+Enter)"
            >
              <Play className="w-4 h-4" />
              Run
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="w-full grid grid-cols-2 gap-6">
          {/* Editor */}
          <div className="w-full space-y-6 h-full">
            {/* Editor Panel */}
            <div className="bg-[#1e293b] h-full rounded-xl shadow-lg overflow-hidden border border-slate-700">
              <div className="bg-[#0f172a] px-4 py-2 border-b border-slate-700 flex items-center">
                <div className="flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm font-medium">
                    main.{languages.find((lang) => lang.value === language)?.extension}
                  </span>
                </div>
                <div className="ml-auto flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
              </div>
              <Editor
                height="70vh"
                defaultLanguage={language}
                language={language}
                value={code}
                onChange={handleEditorChange}
                onMount={handleEditorDidMount}
                theme={theme}
                options={{
                  minimap: { enabled: true },
                  fontSize: fontSize,
                  wordWrap: "on",
                  lineNumbers: "on",
                  automaticLayout: true,
                  cursorBlinking: "smooth",
                  smoothScrolling: true,
                  cursorSmoothCaretAnimation: true,
                  padding: { top: 16 },
                }}
              />
            </div>
          </div>

          <div className="w-full space-y-6 h-full">
            {/* Input Panel */}
            <div className="bg-[#1e293b] rounded-xl shadow-lg border border-slate-700 overflow-hidden">
              <div className="bg-[#0f172a] px-4 py-2 border-b border-slate-700 flex items-center">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm font-medium">Input</span>
                </div>
                <div className="ml-auto text-xs text-slate-400">Enter program inputs here (one input per line)</div>
              </div>
              <textarea
                value={input}
                onChange={handleInputChange}
                className="bg-[#0f172a] p-4 h-[20vh] w-full overflow-auto font-mono text-sm resize-none focus:outline-none focus:ring-1 focus:ring-emerald-500"
                placeholder="Enter your program inputs here..."
              />
            </div>

            {/* Output Panel */}
            <div className="bg-[#1e293b] rounded-xl shadow-lg border border-slate-700 overflow-hidden">
              <div className="bg-[#0f172a] px-4 py-2 border-b border-slate-700 flex items-center">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm font-medium">Output</span>
                </div>
                <div className="ml-auto flex items-center gap-2">
                  <span className="text-xs text-slate-400">Press</span>
                  <kbd className="px-2 py-0.5 bg-slate-700 rounded text-xs">Ctrl+Enter</kbd>
                  <span className="text-xs text-slate-400">to run</span>
                </div>
              </div>
              <div className="bg-[#0f172a] p-4 h-[20vh] overflow-auto font-mono text-sm whitespace-pre-wrap">
                {output || "Output will appear here..."}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center animate-fadeIn backdrop-blur-sm z-50">
          <div className="bg-[#1e293b] p-6 rounded-xl shadow-xl w-96 border border-slate-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Settings</h2>
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium">Font Size</label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="12"
                    max="24"
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    className="w-full accent-emerald-500"
                  />
                  <span className="text-sm bg-[#0f172a] px-2 py-1 rounded-md min-w-[40px] text-center">
                    {fontSize}px
                  </span>
                </div>
              </div>
              <div className="p-4 bg-[#0f172a] rounded-lg border border-slate-700">
                <h3 className="text-sm font-semibold mb-3 text-emerald-400">Keyboard Shortcuts</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <span className="text-slate-300">Run Code:</span>
                  <span>
                    <kbd className="px-2 py-0.5 bg-slate-700 rounded text-xs">Ctrl+Enter</kbd>
                  </span>
                  <span className="text-slate-300">Save:</span>
                  <span>
                    <kbd className="px-2 py-0.5 bg-slate-700 rounded text-xs">Ctrl+S</kbd>
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="w-full py-2 bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CodeEditor
