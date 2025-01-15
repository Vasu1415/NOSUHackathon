import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const menuItems = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Test Prep', path: '/test-prep' },
    { name: 'Mini Test', path: '/mini-test' },
    { name: 'Test Grader', path: '/test-grader' },
    { name: 'Progress', path: '/progress' },
];


function TestPrep() {
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
            <aside className="w-full md:w-60 bg-gray-900 text-white p-5 flex-shrink-0">
                <h1 className="text-3xl font-bold mb-16 text-center  text-purple-400">Study Buddy</h1>
                <nav>
                    <ul className="space-y-20">
                        {menuItems.map((item) => (
                            <li
                                key={item.name}
                                onClick={() => handleNavigation(item.path)}
                                className={`block font-semibold text-2xl text-center cursor-pointer ${
                                    activeTab === item.name
                                        ? 'text-purple-400'
                                        : 'hover:text-purple-400'
                                }`}
                            >
                                {item.name}
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
                            className="w-12 h-12 rounded-full cursor-pointer border-2 border-purple-400"
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
                                        className="px-4 py-2 hover:bg-gray-200 cursor-pointer text-red-600"
                                        onClick={() => navigate('/')}
                                    >
                                        Log out
                                    </li>
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
export default TestPrep;