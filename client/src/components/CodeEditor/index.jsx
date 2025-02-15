import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import {
    Play,
    Settings,
    Files,
    Terminal,
    Code2,
    Save,
    Download,
    Copy,
    Trash2,
    RotateCcw,
    Layout,
    Monitor,
    Coffee,
    Clock
} from 'lucide-react';
import axios from 'axios';

const CodeEditor = () => {
    const [code, setCode] = useState('// Write your code here\nprint("Hello, World!")');
    const [output, setOutput] = useState('');
    const [language, setLanguage] = useState('python');
    const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
    const [theme, setTheme] = useState('vs-dark');
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [fontSize, setFontSize] = useState(14);
    const [isLoading, setIsLoading] = useState(false);
    const [lastSaved, setLastSaved] = useState(new Date());

    const handleEditorChange = (value) => {
        setCode(value);
    };

    const runCode = async () => {
        setIsLoading(true);
        setOutput('Running...');
        try {
            const response = await axios.post('http://localhost:5000/execute', {
                language,
                code,
            });
            setOutput(response.data.output);
        } catch (error) {
            setOutput(`Error: ${error.response?.data?.error || error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const languages = [
        { value: 'javascript', label: 'JavaScript', icon: '⚡', code: 'console.log("Hello World"); ' },
        { value: 'typescript', label: 'TypeScript', icon: '📘', code: 'console.log("Hello World"); ' },
        { value: 'python', label: 'Python', icon: '🐍', code: 'print("Hello")' },
        { value: 'cpp', label: 'C++', icon: '⚙️', code: '#include<bits/stdc++.h>\nusing namespace std;\n\nint main() {\n\tcout << "Hello World";\n}' },
        { value: 'java', label: 'Java', icon: '☕', code: 'class Main {\n\tpublic static void main(String[] args) {\n\t\tSystem.out.println("Hello World");\n\t}\n}' }
    ];

    const saveCode = () => {
        setLastSaved(new Date());
        // Add save animation
        const saveButton = document.getElementById('saveButton');
        saveButton.classList.add('animate-ping');
        setTimeout(() => saveButton.classList.remove('animate-ping'), 1000);
    };

    const copyCode = () => {
        navigator.clipboard.writeText(code);
        // Add copy animation
        const copyButton = document.getElementById('copyButton');
        copyButton.classList.add('scale-110');
        setTimeout(() => copyButton.classList.remove('scale-110'), 200);
    };

    const resetCode = () => {
        const tempCode = languages.find(lang => lang.value === language)?.code;
        setCode(tempCode);
    }
    return (
        <div className="min-h-screen bg-gray-900 text-gray-100">
            {/* Top Navigation Bar */}
            <div className="border-b border-gray-700 bg-gray-800 p-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Code2 className="w-6 h-6 text-blue-400" />
                        <h1 className="text-xl font-bold">DevSphere IDE</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <Coffee className="w-5 h-5 text-gray-400" />
                        <Clock className="w-5 h-5 text-gray-400" />
                        <span className="text-sm text-gray-400">
                            Last saved: {lastSaved.toLocaleTimeString()}
                        </span>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-6">
                {/* Toolbar */}
                <div className="mb-6 flex items-center justify-between bg-gray-800 p-4 rounded-lg shadow-lg">
                    <div className="flex items-center gap-4">
                        {/* Language Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors"
                            >
                                {languages.find(lang => lang.value === language)?.icon}
                                {languages.find(lang => lang.value === language)?.label}
                            </button>

                            {isLanguageDropdownOpen && (
                                <div className="absolute z-10 mt-1 w-48 bg-gray-700 rounded-md shadow-xl border border-gray-600 animate-fadeIn">
                                    <ul className="py-1">
                                        {languages.map((lang) => (
                                            <li
                                                key={lang.value}
                                                onClick={() => {
                                                    setLanguage(lang.value);
                                                    setIsLanguageDropdownOpen(false);
                                                    setCode(lang.code)
                                                }}
                                                className="flex items-center gap-2 px-4 py-2 hover:bg-gray-600 cursor-pointer"
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
                        <button
                            id="saveButton"
                            onClick={saveCode}
                            className="p-2 hover:bg-gray-700 rounded-md transition-all"
                            title="Save"
                        >
                            <Save className="w-5 h-5" />
                        </button>
                        <button
                            id="copyButton"
                            onClick={copyCode}
                            className="p-2 hover:bg-gray-700 rounded-md transition-all"
                            title="Copy"
                        >
                            <Copy className="w-5 h-5" />
                        </button>
                        <button
                            className="p-2 hover:bg-gray-700 rounded-md transition-all"
                            title="Reset"
                            onClick={resetCode}
                        >
                            <RotateCcw className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setTheme(theme === 'vs-dark' ? 'light' : 'vs-dark')}
                            className="p-2 hover:bg-gray-700 rounded-md transition-all"
                            title="Toggle Theme"
                        >
                            <Monitor className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                            className="p-2 hover:bg-gray-700 rounded-md transition-all"
                            title="Settings"
                        >
                            <Settings className="w-5 h-5" />
                        </button>
                        <button
                            onClick={runCode}
                            className={`flex items-center gap-2 px-6 py-2 bg-green-600 rounded-md hover:bg-green-700 transition-colors ${isLoading ? 'animate-pulse' : ''
                                }`}
                        >
                            <Play className="w-4 h-4" />
                            Run
                        </button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* File Explorer */}
                    <div className="lg:col-span-1 bg-gray-800 rounded-lg p-4 shadow-lg">
                        <div className="flex items-center gap-2 mb-4">
                            <Files className="w-5 h-5" />
                            <h2 className="font-semibold">Explorer</h2>
                        </div>
                        <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2 p-2 hover:bg-gray-700 rounded cursor-pointer">
                                📄 index.{language}
                            </div>
                            <div className="flex items-center gap-2 p-2 hover:bg-gray-700 rounded cursor-pointer">
                                📄 README.md
                            </div>
                        </div>
                    </div>

                    {/* Editor and Output */}
                    <div className="lg:col-span-3 space-y-6">
                        {/* Editor Panel */}
                        <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                            <Editor
                                height="50vh"
                                defaultLanguage={language}
                                language={language}
                                value={code}
                                onChange={handleEditorChange}
                                theme={theme}
                                options={{
                                    minimap: { enabled: true },
                                    fontSize: fontSize,
                                    wordWrap: 'on',
                                    lineNumbers: 'on',
                                    automaticLayout: true,
                                    cursorBlinking: 'smooth',
                                    smoothScrolling: true,
                                    cursorSmoothCaretAnimation: true,
                                }}
                            />
                        </div>

                        {/* Output Panel */}
                        <div className="bg-gray-800 rounded-lg shadow-lg p-4">
                            <div className="flex items-center gap-2 mb-4">
                                <Terminal className="w-5 h-5" />
                                <h2 className="font-semibold">Output</h2>
                            </div>
                            <div className="bg-black rounded-lg p-4 h-[20vh] overflow-auto font-mono text-sm">
                                {output || 'Output will appear here...'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Settings Modal */}
            {isSettingsOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center animate-fadeIn">
                    <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-96">
                        <h2 className="text-xl font-bold mb-4">Settings</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block mb-2">Font Size</label>
                                <input
                                    type="range"
                                    min="12"
                                    max="24"
                                    value={fontSize}
                                    onChange={(e) => setFontSize(Number(e.target.value))}
                                    className="w-full"
                                />
                                <span className="text-sm">{fontSize}px</span>
                            </div>
                            <button
                                onClick={() => setIsSettingsOpen(false)}
                                className="w-full py-2 bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CodeEditor;