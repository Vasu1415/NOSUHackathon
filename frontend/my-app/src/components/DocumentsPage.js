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

function Documents() {
    const navigate = useNavigate();
    const location = useLocation();
    const [activeTab, setActiveTab] = useState('');
    // const [profileMenuOpen, setProfileMenuOpen] = useState(false);
    // const [profilePicture, setProfilePicture] = useState('');

    const handleNavigation = (path) => {
        navigate(path);
    };

    useEffect(() => {
        const currentItem = menuItems.find((item) => item.path === location.pathname);
        if (currentItem) setActiveTab(currentItem.name);
    }, [location.pathname]);

    // useEffect(() => {
    //     async function fetchProfileData() {
    //         try {
    //             const response = await fetch('/api/user-profile'); // Adjust endpoint as necessary
    //             const data = await response.json();
    //             setProfilePicture(data.profile_picture_url);
    //         } catch (error) {
    //             console.error('Error fetching profile data:', error);
    //         }
    //     }

    //     fetchProfileData();
    // }, []);

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

            {/* Main Content */}
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

                {/* Header */}
                <header className="mb-12 text-center">
                    <h2 className="text-4xl font-bold text-red-500">Documents</h2>
                    <p className="text-gray-400 mt-2 text-lg">
                        See your uploaded documents below.
                    </p>
                </header>
            </main>
        </div>
    );
}

export default Documents;
