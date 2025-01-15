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

// Mock quiz data
const mockQuestions = [
    {
        question: "What is the chemical symbol for water?",
        options: ["H2O", "O2", "CO2", "NaCl"],
        answer: "H2O"
    },
    {
        question: "What planet is known as the Red Planet?",
        options: ["Earth", "Mars", "Jupiter", "Saturn"],
        answer: "Mars"
    },
    {
        question: "What gas do plants absorb from the atmosphere?",
        options: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Hydrogen"],
        answer: "Carbon Dioxide"
    },
    {
        question: "What is the hardest natural substance on Earth?",
        options: ["Gold", "Iron", "Diamond", "Silver"],
        answer: "Diamond"
    },
    {
        question: "What is the process by which plants make their food?",
        options: ["Respiration", "Photosynthesis", "Digestion", "Transpiration"],
        answer: "Photosynthesis"
    }
];

// Mock topics data
const mockTopics = ["Math", "Science", "History", "Geography"];

const fetchQuestions = async (topic) => {
    try {
        const response = await fetch(`http://127.0.0.1:5000/api/generate-questions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ topic }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('API Response:', data);

        // Process questions and answers
        const processedQuestions = data.questions[0]
            .split('\n\n') // Split by double newline to separate questions
            .map((q) => {
                const parts = q.split('\n'); // Split question and options
                const questionText = parts[0];
                const options = parts.slice(1).map((o) => o.trim().split('. ')[1]); // Extract options (A., B., etc.)
                return {
                    question: questionText,
                    options,
                };
            });

        const processedAnswers = data.answers[0]
            .match(/["'](.*?)["']/g) // Extract answers within quotes
            .map((answer) => answer.replace(/["']/g, '')); // Remove quotes

        return { questions: processedQuestions, answers: processedAnswers };
    } catch (error) {
        console.error('Error fetching questions:', error);
        return { questions: mockQuestions, answers: [] }; // Fallback to mock data
    }
};


function MiniTest() {
    const navigate = useNavigate();
    const location = useLocation();
    const [activeTab, setActiveTab] = useState('');
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);
    const [profilePicture, setProfilePicture] = useState('');
    const [timeElapsed, setTimeElapsed] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [intervalId, setIntervalId] = useState(null);
    const [questions, setQuestions] = useState([]); // State for questions
    const [selectedTopic, setSelectedTopic] = useState(''); // State for selected topic
    const [quizStarted, setQuizStarted] = useState(false); // State to control quiz display

    // Flashcard State
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState('');
    const [score, setScore] = useState(0);
    const [showResults, setShowResults] = useState(false);
    const [answers, setAnswers] = useState([]); // State for answers

    const currentQuestion = questions[currentQuestionIndex];

    const handleNavigation = (path) => {
        navigate(path);
    };

    useEffect(() => {
        // Set the active tab based on the current path
        const currentItem = menuItems.find((item) => item.path === location.pathname);
        if (currentItem) setActiveTab(currentItem.name);
    }, [location.pathname]);

    useEffect(() => {
        // Fetch user profile data from API
        async function fetchProfileData() {
            try {
                const response = await fetch('http://127.0.0.1:5000/api/user-profile'); // Adjust the endpoint as necessary
                const text = await response.text();
                console.log('Raw Profile Response:', text); // Log the raw response
                const data = JSON.parse(text);
                setProfilePicture(data.profile_picture_url);
            } catch (error) {
                console.log('Error fetching profile data:', error);
            }
        }

        fetchProfileData();
    }, []);

    const toggleProfileMenu = () => {
        setProfileMenuOpen((prev) => !prev);
    };

    // Stopwatch toggle
    useEffect(() => {
    let intervalId = null;
    if (quizStarted) {
        intervalId = setInterval(() => {
            setTimeElapsed((prevTime) => prevTime + 1);
        }, 1000);
    }
    return () => clearInterval(intervalId); // Cleanup on unmount or state change
}, [quizStarted]);

    
    const toggleStopwatch = () => {
        setIsRunning((prevState) => !prevState);
    };

    const formatTime = (time) => {
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    // Handle answer selection
    const handleOptionClick = (option) => {
        setSelectedOption(option);
        if (option === currentQuestion.answer) {
            setScore((prevScore) => prevScore + 1);
        }
    };

    const handleNextQuestion = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
            setSelectedOption('');
        } else {
            setShowResults(true);
            setIsRunning(false); // Stop the stopwatch
        }
    };

    const restartQuiz = () => {
        setCurrentQuestionIndex(0);
        setSelectedOption('');
        setScore(0);
        setShowResults(false);
        setTimeElapsed(0);
        setIsRunning(false);
        setQuizStarted(false); // Reset quiz started state
    };

    const startQuiz = async () => {
        if (!selectedTopic) {
            console.error('Please select a topic before starting the quiz');
            return;
        }
    
        const { questions, answers } = await fetchQuestions(selectedTopic);
        if (Array.isArray(questions) && Array.isArray(answers)) {
            setQuestions(questions);
            setAnswers(answers);
            setQuizStarted(true);
            setIsRunning(true); // Start the stopwatch
        } else {
            console.error('Failed to load questions and answers');
        }
    };
    
    
    return (
        <div className="min-h-screen flex flex-col md:flex-row">
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
            <main className="flex-1 p-6 bg-black relative">
                {/* Log Out Button */}
                <div className="absolute top-6 right-6">
                    <button
                        className="px-6 py-2 bg-red-500 text-black font-semibold rounded-lg hover:bg-red-600 transition"
                        onClick={() => handleNavigation("/")}
                    >
                        Log Out
                    </button>
                </div>

                <header className='mb-8 text-center'>
                    <h2 className="text-6xl font-bold text-center mt-20 text-white">Mini Test</h2>
                    <p className="text-gray-400 mt-2 text-center text-2xl">Enter a topic(s) of your choice and get test questions. </p>
                </header>

                {/* Topic Dropdown */}
                <div className="flex justify-between items-center bg-gray-800 p-4 rounded-lg shadow-md w-96 mx-auto mb-6">
                    <label className="text-red-500 text-2xl">Select Topic</label>
                    <select
                        value={selectedTopic}
                        onChange={(e) => setSelectedTopic(e.target.value)}
                        className="py-2 px-4 text-xl border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500">
                        <option value="">Select a topic...</option>
                        {mockTopics.map((topic) => (
                            <option key={topic} value={topic}>
                                {topic}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Start Test Button */}
                <div className="flex justify-center mb-4">
                    <button
                        onClick={startQuiz}
                        disabled={!selectedTopic}
                        className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-500">
                        Start Test
                    </button>
                </div>

                {/* Stopwatch */}
                {quizStarted && (
                    <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-lg w-80 mx-auto">
                        <p className="text-red-500 text-3xl">Elapsed Time: {formatTime(timeElapsed)}</p>
                        <button 
                            onClick={toggleStopwatch} 
                            className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-500">
                            {isRunning ? 'Stop' : 'Start'}
                        </button>
                    </div>
                )}

                {/* Flashcard Section */}
{quizStarted && !showResults ? (
    <div className="mt-12 bg-gray-800 text-white p-8 rounded-lg shadow-lg text-center">
        <h3 className="text-4xl font-semibold mb-6">
            {currentQuestion ? currentQuestion.question : "Loading question..."}
        </h3>
        <div className="grid grid-cols-2 gap-4">
            {currentQuestion && currentQuestion.options ? (
                currentQuestion.options.map((option, index) => (
                    <button
                        key={index} // Use `index` as a key since `options` don't have unique identifiers
                        onClick={() => handleOptionClick(option)}
                        className={`py-3 px-6 rounded-lg text-xl font-semibold ${
                            selectedOption === option
                                ? option === currentQuestion.correctAnswer
                                    ? 'bg-green-500'
                                    : 'bg-red-500'
                                : 'bg-gray-500 hover:bg-gray-600'
                        }`}>
                        {option}
                    </button>
                ))
            ) : (
                <p>Loading options...</p>
            )}
        </div><button
            onClick={handleNextQuestion}
            disabled={!selectedOption}
            className="mt-8 px-8 py-3 bg-red-500 text-white text-xl rounded-lg hover:bg-red-500">
            {currentQuestionIndex < questions.length - 1 ? 'Next' : 'Finish'}
        </button></div>
) : (quizStarted && (
        <div className="mt-12 text-center">
            <h2 className="text-5xl font-bold text-green-400">Quiz Completed!</h2>
            <p className="text-white text-3xl mt-4">Your Score: {score}/{questions.length}</p>
            <button onClick={restartQuiz} className="mt-8 px-8 py-3 bg-red-500 text-white text-xl rounded-lg hover:bg-red-500">
                Restart Quiz
            </button>
        </div>
    ))}
            </main>
        </div>
    );
}

export default MiniTest;