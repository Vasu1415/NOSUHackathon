import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaTachometerAlt, FaFileAlt, FaFileUpload, FaChartLine, FaFolder } from "react-icons/fa"; // Import icons

const menuItems = [
    { name: "Dashboard", path: "/dashboard", icon: <FaTachometerAlt /> },
    { name: "Test Grader", path: "/test-grader", icon: <FaFileUpload /> },
    { name: "Mini Test", path: "/mini-test", icon: <FaFileAlt /> },
    { name: "Documents", path: "/documents", icon: <FaFolder /> },
    { name: "Progress Tracker", path: "/progress", icon: <FaChartLine /> },
  ];

function TestGrader() {
    const navigate = useNavigate();
    const [uploadedFile, setUploadedFile] = useState(null);
    const [selectedModel, setSelectedModel] = useState('');
    const [activeTab, setActiveTab] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [feedback, setFeedback] = useState('');
    const location = useLocation();

    const handleNavigation = (path) => {
        navigate(path);
    };

    const handleFileUpload = (e) => {
        e.preventDefault();
        const file = e.target.files ? e.target.files[0] : e.dataTransfer.files[0];
        if (file) {
            setUploadedFile(file);
            setError(null);
        }
    };

    const handleModelChange = (e) => {
        e.preventDefault();
        setSelectedModel(e.target.value);
        setError(null);
    };

    const handleSubmit = async () => {
        if (!uploadedFile) {
            setError('Please upload a document.');
            return;
        }
        if (!selectedModel) {
            setError('Please select a model.');
            return;
        }

        setError(null);
        setLoading(true);

        const formData = new FormData();
        formData.append('document', uploadedFile); // Changed to match backend expectation
        formData.append('model', selectedModel); // Changed to match backend expectation

        try {
            const response = await fetch('http://127.0.0.1:5000/api/test-grader', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.errors || 'Failed to submit form');
            }

            const data = await response.json();
            setFeedback(data.feedback || 'No feedback available');
        } catch (err) {
            setError(err.message || 'An error occurred while submitting the form.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        handleFileUpload(e);
    };

    useEffect(() => {
        const currentItem = menuItems.find((item) => item.path === location.pathname);
        if (currentItem) setActiveTab(currentItem.name);
    }, [location.pathname]);

    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-black text-white">
            {/* Sidebar */}
            <aside className="w-full md:w-64 bg-black text-white p-6 border-r border-gray-700 flex-shrink-0">
                <h1 className="text-3xl font-bold mb-12 text-center text-red-500">Study Buddy</h1>
                <nav>
                <ul className="space-y-8"> {/* Increased spacing */}
                    {menuItems.map((item) => (
                    <li key={item.name}>
                        <div
                        onClick={() => handleNavigation(item.path)}
                        className={`flex items-center space-x-3 p-4 rounded-lg cursor-pointer ${
                            activeTab === item.name
                            ? "bg-red-500 text-black"
                            : "hover:bg-gray-800 hover:text-red-500"
                        }`}
                        >
                        {item.icon}
                        <span className="font-medium">{item.name}</span>
                        </div>
                    </li>
                    ))}
                </ul>
                </nav>
            </aside>
      
            {/* Main Content */}
            <main className="flex-1 p-8 relative">

                {/* Log Out Button */}
                <div className="absolute top-6 right-6">
                <button
                    className="px-6 py-2 bg-red-500 text-black font-semibold rounded-lg hover:bg-5 transition"
                    onClick={() => handleNavigation("/")}
                >
                    Log Out
                </button>
                </div>

                <header className="mb-12 text-center">
                    <h2 className="text-4xl font-bold">Test Grader</h2>
                    <p className="text-gray-400 mt-2 text-lg">Upload your exams and get instant feedback.</p>
                </header>

                <div
                    className="flex flex-col items-center justify-center border-2 border-dashed border-red-400 rounded-xl p-12 bg-red-200 bg-opacity-15 w-full max-w-4xl min-h-[60vh] mx-auto"
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                >
                    <p className="text-3xl font-medium mb-6 text-red-500">
                        Click to upload, or drag your PDF file here
                    </p>

                    <input
                        type="file"
                        name="document" // Match backend
                        accept=".pdf"
                        className="hidden"
                        id="file-upload"
                        onChange={handleFileUpload}
                    />
                    <label
                        htmlFor="file-upload"
                        className="text-lg cursor-pointer px-10 py-4 bg-red-500 text-white rounded-lg hover:bg-red-700 font-medium"
                    >
                        Upload PDF
                    </label>

                    {uploadedFile && (
                        <div className="mt-6 p-4 border border-gray-300 rounded-lg bg-gray-50 w-full max-w-lg font-medium">
                            <p className="text-xl text-gray-600">Uploaded File: </p>
                            <p className="text-gray-800 font-medium">{uploadedFile.name}</p>
                        </div>
                    )}

                    <div className="mt-8 w-full max-w-md flex flex-col items-center pt-10">
                        <label
                            htmlFor="model-select"
                            className="block text-3xl mb-4 text-red-500 font-medium"
                        >
                            Select Model for Feedback:
                        </label>
                        <select
                            id="model-select"
                            name="model" // Match backend
                            value={selectedModel}
                            onChange={handleModelChange}
                            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-5 font-bold text-black"
                        >
                            <option value="">-- Select a model --</option>
                            <option value="gpt">gpt-4o</option>
                            <option value="llama">Llama-3.3-70B-Instruct</option>
                            <option value="mistral">Mistral-Large-2411</option>
                        </select>
                    </div>

                    <button
                        onClick={handleSubmit}
                        className="text-lg mt-8 px-10 py-4 bg-5 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
                        disabled={loading || !uploadedFile || !selectedModel}
                    >
                        Submit
                    </button>

                    {error && (
                        <div className="mt-4 p-4 text-red-700 bg-red-100 border border-red-300 rounded-lg">
                            {error}
                        </div>
                    )}

                    {feedback && (
                        <div className="mt-4 p-4 text-green-700 bg-green-100 border border-green-300 rounded-lg">
                            {feedback}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
export default TestGrader;