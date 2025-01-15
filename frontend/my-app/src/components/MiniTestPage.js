import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaTachometerAlt, FaFileAlt, FaFileUpload } from 'react-icons/fa'; // Import icons

const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <FaTachometerAlt /> },
    { name: 'Test Grader', path: '/test-grader', icon: <FaFileUpload /> },
    { name: 'Mini Test', path: '/mini-test', icon: <FaFileAlt /> },
];

function MiniTest (){
    const navigate = useNavigate();
    const location = useLocation();
    const [activeTab, setActiveTab] = useState('');
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);
    const [profilePicture, setProfilePicture] = useState('');
    const [timeElapsed, setTimeElapsed] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [intervalId, setIntervalId] = useState(null);


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
            } catch (error) {
                console.error('Error fetching profile data:', error);
            }
        }

        fetchProfileData();
    }, []);

    const toggleProfileMenu = () => {
        setProfileMenuOpen((prev) => !prev);
    };

    //stopwatch toggle
    useEffect(() => {
        if (isRunning){
            const id = setInterval(() => {
                setTimeElapsed((prevTime) => prevTime + 1);
            }, 1000);

            setIntervalId(id);
            return () => clearInterval(id);

        } else{
            clearInterval(intervalId);
        }
    }, [isRunning, intervalId]); 

    const toggleStopwatch = () => {
        setIsRunning((prevState) => !prevState);
    }

    const formatTime = (time) =>{
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }

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
                        {/*MAKE SURE THE PROFILE API CALL IS CORRECTLY*/}
                        <img src={profilePicture || '/path/to/default-profile.jpg'} alt="Profile"
                            className="w-12 h-12 rounded-full cursor-pointer border-2 border-rose-400"
                            onClick={toggleProfileMenu} />

                        {profileMenuOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white text-black rounded-lg shadow-lg">
                                <ul className="py-2">
                                    <li className="px-4 py-2 hover:bg-gray-200 cursor-pointer font-semibold  border-b border-gray-300 text-lg"
                                        onClick={() => handleNavigation('/update-profile')} >
                                        Update Profile
                                    </li>
                                    <li className="px-4 py-2 hover:bg-gray-200 cursor-pointer font-semibold border-b border-gray-300 text-lg"
                                        onClick={() => handleNavigation('/documents')} >
                                        Documents
                                    </li>
                                    <li className="px-4 py-2 hover:bg-gray-200 cursor-pointer font-semibold border-b border-gray-300 text-lg"
                                        onClick={() => handleNavigation('/progress')} >
                                        Progress
                                    </li>
                                    <li className="px-4 py-2 hover:bg-gray-200 cursor-pointer text-red-600 font-semibold text-lg"
                                        onClick={() => navigate('/logout')} >
                                        Log out
                                    </li>
                                </ul>
                            </div>
                        )}
                    </div>
                </div>


                <header className='mb-8 text-center'>
                    <h2 className="text-6xl font-bold text-center mt-20 text-white">Mini Test</h2>
                    <p className="text-gray-400 mt-2 text-center text-2xl">Enter a topic(s) of your choice and get test questions. </p>

                </header>

                {/* Stopwatch */}
                <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-lg w-80 mx-auto">
                    <p className="text-rose-500 text-3xl">Elapsed Time: {formatTime(timeElapsed)}</p>
                    <button 
                        onClick={toggleStopwatch} 
                        className="px-6 py-3 bg-rose-500 text-white rounded-lg hover:bg-rose-600">
                        {isRunning ? 'Stop' : 'Start'}
                    </button>
                </div>

            </main>
        </div>
    );
}
export default MiniTest;