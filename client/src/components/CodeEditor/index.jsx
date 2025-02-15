import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Play } from 'lucide-react';
import axios from 'axios';

const CodeEditor = () => {
    const [code, setCode] = useState('// Write your code here\nprint("Hello, World!")');
    const [output, setOutput] = useState('');
    const [language, setLanguage] = useState('python');
    const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);

    const handleEditorChange = (value) => {
        setCode(value);
    };

    const runCode = async () => {
        setOutput('Running...');
        try {
            const response = await axios.post('http://localhost:5000/execute', {
                language,
                code,
            });
            setOutput(response.data.output);
        } catch (error) {
            setOutput(`Error: ${error.response?.data?.error || error.message}`);
        }
    };

    const languages = [
        { value: 'javascript', label: 'JavaScript' },
        { value: 'typescript', label: 'TypeScript' },
        { value: 'python', label: 'Python' },
        { value: 'cpp', label: 'C++' },
        { value: 'java', label: 'Java' }
    ];

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-6xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-900">Multi-Language Code Editor</h1>
                    <div className="flex items-center gap-4">
                        {/* Language Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
                                className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
                            >
                                {languages.find(lang => lang.value === language)?.label || 'Language'}
                            </button>

                            {isLanguageDropdownOpen && (
                                <div className="absolute z-10 mt-1 w-40 bg-white shadow-lg rounded-md border border-gray-200">
                                    <ul className="py-1">
                                        {languages.map((lang) => (
                                            <li
                                                key={lang.value}
                                                onClick={() => {
                                                    setLanguage(lang.value);
                                                    setIsLanguageDropdownOpen(false);
                                                }}
                                                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                                            >
                                                {lang.label}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                        {/* Run Button */}
                        <button
                            onClick={runCode}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none transition-colors"
                        >
                            <Play className="w-4 h-4" />
                            Run Code
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Editor Panel */}
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                        <Editor
                            height="60vh"
                            defaultLanguage={language}
                            language={language}
                            value={code}
                            onChange={handleEditorChange}
                            theme="vs-dark"
                            options={{
                                minimap: { enabled: false },
                                fontSize: 14,
                                wordWrap: 'on',
                                lineNumbers: 'on',
                                automaticLayout: true,
                            }}
                        />
                    </div>
                    {/* Output Panel */}
                    <div className="bg-white rounded-lg shadow-sm p-4">
                        <h2 className="text-lg font-semibold mb-2">Output</h2>
                        <div className="bg-gray-900 text-gray-100 p-4 rounded-lg h-[calc(60vh-4rem)] overflow-auto font-mono whitespace-pre-wrap">
                            {output || 'Output will appear here...'}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CodeEditor;
