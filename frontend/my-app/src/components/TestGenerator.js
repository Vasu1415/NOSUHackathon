import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaTachometerAlt, FaFileAlt, FaFileUpload } from 'react-icons/fa'; // Import icons

const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <FaTachometerAlt /> },
    { name: 'Test Grader', path: '/test-grader', icon: <FaFileUpload /> },
    { name: 'Test Generator', path: '/test-generator', icon: <FaFileAlt /> },
];

function TestGenerator (){
    const navigate = useNavigate();
    const location = useLocation();
    const [activeTab, setActiveTab] = useState('');
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);
    const [profilePicture, setProfilePicture] = useState('');
    const [userEmail, setUserEmail] = useState('');


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
                const response = await fetch('/api/user-profile'); // Adjust the endpoint as necessary
                const data = await response.json();
                setProfilePicture(data.profile_picture_url);
                setUserEmail(data.email);
            } catch (error) {
                console.error('Error fetching profile data:', error);
            }
        }

        fetchProfileData();
    }, []);

    const toggleProfileMenu = () => {
        setProfileMenuOpen((prev) => !prev);
    };

    return (
        <div className="min-h-screen flex flex-col md:flex-row">
            {/* Sidebar */}
            <aside className="w-full md:w-72 bg-gray-900 text-white p-5 flex-shrink-0">
                <h1 className="text-3xl font-bold mb-16 text-center text-rose-400">Study Buddy</h1>
                <nav>
                    <ul className="space-y-20 ">
                        {menuItems.map((item, index) => (
                            <li key={item.name} className="relative pb-4">
                                <div
                                    onClick={() => handleNavigation(item.path)}
                                    className={`flex items-center space-x-4 font-semibold text-2xl cursor-pointer  ${
                                        activeTab === item.name
                                            ? 'text-rose-400'
                                            : 'hover:text-rose-400'
                                    }`}
                                >
                                    {item.icon} {/* Icon */}
                                    <span>{item.name}</span>
                                </div>
                                {/* Partial horizontal line */}
                                {index < menuItems.length - 1 && (
                                    <div className="absolute left-4 right-4 top-full border-t border-gray-700 mt-8"></div>
                                )}
                            </li>
                        ))}
                    </ul>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-6 bg-slate-950 relative">
                {/* Profile Icon */}
                <div className="absolute top-6 right-6">
                    <div className="relative">
                        <img
                            src={profilePicture || '/path/to/default-profile.jpg'}
                            alt="Profile"
                            className="w-12 h-12 rounded-full cursor-pointer border-2 border-rose-400"
                            onClick={toggleProfileMenu}
                        />
                        {profileMenuOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white text-black rounded-lg shadow-lg">
                                <ul className="py-2">
                                    <li className="px-4 py-2 hover:bg-gray-200">{userEmail}</li>
                                    <li
                                        className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
                                        onClick={() => handleNavigation('/update-profile')}
                                    >
                                        Update Profile
                                    </li>
                                    <li
                                        className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
                                        onClick={() => handleNavigation('/documents')}
                                    >
                                        Documents
                                    </li>
                                    <li
                                        className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
                                        onClick={() => handleNavigation('/progress')}
                                    >
                                        Progress
                                    </li>
                                    <li
                                        className="px-4 py-2 hover:bg-gray-200 cursor-pointer text-red-600"
                                        onClick={() => navigate('/logout')}
                                    >
                                        Log out
                                    </li>
                                </ul>
                            </div>
                        )}
                    </div>
                </div>


                <header className='mb-8 text-center'>
                    <h2 className="text-6xl font-bold text-center mt-20 text-white">Test Generator</h2>
                    <p className="text-gray-400 mt-2 text-center text-2xl">Enter a topic(s) of your choice and get test questions. </p>

                </header>

            </main>
        </div>
    );
}
export default TestGenerator;