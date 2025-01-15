import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaTachometerAlt, FaFileAlt, FaFileUpload, FaChartLine, FaFolder } from "react-icons/fa"; 
import { VerticalTimeline, VerticalTimelineElement } from 'react-vertical-timeline-component';
import 'react-vertical-timeline-component/style.min.css';
import { MdOutlineTopic, MdFeedback } from 'react-icons/md';
import { Bar } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const menuItems = [
    { name: "Dashboard", path: "/dashboard", icon: <FaTachometerAlt /> },
    { name: "Test Grader", path: "/test-grader", icon: <FaFileUpload /> },
    { name: "Mini Test", path: "/mini-test", icon: <FaFileAlt /> },
    { name: "Documents", path: "/documents", icon: <FaFolder /> },
    { name: "Progress Tracker", path: "/progress", icon: <FaChartLine /> },
  ];

function Progress() {
    const navigate = useNavigate();
    const location = useLocation();
    const [activeTab, setActiveTab] = useState('');
    // const [profileMenuOpen, setProfileMenuOpen] = useState(false);
    // const [profilePicture, setProfilePicture] = useState('');
    const [progressData, setProgressData] = useState([]);

    const handleNavigation = (path) => {
        navigate(path);
    };

    useEffect(() => {
        const currentItem = menuItems.find((item) => item.path === location.pathname);
        if (currentItem) setActiveTab(currentItem.name);
    }, [location.pathname]);

    useEffect(() => {
        const dummyProgressData = [
            {
                date: 'January 15, 2024',
                current_topics: ['Dynamic Programming', 'Graph Algorithms'],
                strong_topics: ['Sorting Algorithms', 'Binary Search'],
                weak_topics: ['Greedy Algorithms', 'Recursion'],
                feedback: 'Focus more on recursion and greedy strategies.'
            },
            {
                date: 'February 10, 2024',
                current_topics: ['Machine Learning Basics', 'Linear Regression'],
                strong_topics: ['Python Programming', 'Data Structures'],
                weak_topics: ['Probability', 'Statistics'],
                feedback: 'Revise probability concepts for better ML understanding.'
            }
        ];
    //     fetch('http://127.0.0.1:5000/api/progress')
    //         .then(response => response.json())
    //         .then(data => setProgressData(data))
    //         .catch(error => console.error('Error fetching progress data:', error));
        setProgressData(dummyProgressData);
    }, []
    );

    // const toggleProfileMenu = () => {
    //     setProfileMenuOpen((prev) => !prev);
    // };

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

            <main className="flex-1 p-8 relative">

                {/* Log Out Button */}
                <div className="absolute top-6 right-6">
                    <button
                        className="px-6 py-2 bg-red-500 text-black font-semibold rounded-lg hover:bg-red-600 transition"
                        onClick={() => handleNavigation("/")}
                    >
                        Log Out
                    </button>
                </div>


                <header className="mb-12 text-center">
                    <h2 className="text-4xl font-bold">Review Exams</h2>
                    <p className="text-gray-400 mt-2 text-lg">See your progress on your graded exams.</p>
                </header>

                {/* Timeline */}
                <VerticalTimeline>
                    {progressData.map((record, index) => (
                        <VerticalTimelineElement
                            key={index}
                            date={record.date}
                            iconStyle={{ background: 'rgb(233, 30, 99)', color: '#fff' }}
                            icon={<MdOutlineTopic />}
                        >
                            <h3 className="text-xl font-bold">Progress Update</h3>

                            {/* 3D Animated Cells */}
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                {record.current_topics.map((topic, i) => (
                                    <div key={i} className="topic-cell bg-blue-500 text-white px-4 py-2 rounded-lg shadow-md transform hover:scale-105 transition-transform duration-300">
                                        {topic}
                                    </div>
                                ))}
                                {record.strong_topics.map((topic, i) => (
                                    <div key={i} className="topic-cell bg-green-500 text-white px-4 py-2 rounded-lg shadow-md transform hover:rotate-3 hover:scale-105 transition-transform duration-300">
                                        {topic}
                                    </div>
                                ))}
                                {record.weak_topics.map((topic, i) => (
                                    <div key={i} className="topic-cell bg-red-500 text-white px-4 py-2 rounded-lg shadow-md transform hover:-rotate-3 hover:scale-105 transition-transform duration-300">
                                        {topic}
                                    </div>
                                ))}
                            </div>

                            {/* Feedback */}
                            <p className="text-gray-300"><MdFeedback className="inline" /> <strong>Feedback:</strong> {record.feedback}</p>

                            {/* Bar Chart */}
                            <Bar
                                data={{
                                    labels: ['Strong Topics', 'Weak Topics'],
                                    datasets: [
                                        {
                                            label: 'Number of Topics',
                                            data: [record.strong_topics.length, record.weak_topics.length],
                                            backgroundColor: ['rgba(34, 197, 94, 0.8)', 'rgba(239, 68, 68, 0.8)'],
                                            borderRadius: 8,
                                        }
                                    ]
                                }}
                                options={{
                                    responsive: true,
                                    plugins: {
                                        legend: { display: false },
                                        title: { display: true, text: 'Strong vs Weak Topics' }
                                    }
                                }}
                            />
                        </VerticalTimelineElement>
                    ))}
                </VerticalTimeline>
            </main>
        </div>
    );
}

export default Progress;
