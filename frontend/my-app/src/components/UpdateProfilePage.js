//No longer using this page

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

function UpdateProfile(){
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setNewConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const [activeTab, setActiveTab] = useState('');
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);
    const [profilePicture, setProfilePicture] = useState('');
    const [userEmail, setUserEmail] = useState('');

    
    const navigate = useNavigate();
    const location = useLocation();

    //Password update
    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        setError(null);

        const passwordStrengthRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()\-_=+\\|[\]{};:/?.>]).{8,}$/;
        if (!passwordStrengthRegex.test(newPassword)) {
            setError('Password must be at least 8 characters long, contain an uppercase letter, a number, and a special character.');
            return;
        }

        if (newPassword !== confirmNewPassword){
            setError('Passwords do not match.');
            return;
        }

        try {
            const response = await fetch ('/api/update-profile', {
                method: 'POST',
                headers: {'Content-Type':'application/json'},
                body: JSON.stringify({userEmail, new_password: newPassword}),
            });

            if (response.status === 200){
                setSuccess('Password reset successful! You can now login.');
            } else {
                const data = await response.json();
                setError(data.message || 'Error resetting password.');
            }
        } catch (err) {
            setError('Unexpected error occurred.')
        }
    };

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
                        onClick={() => handleNavigation("/logout")}
                    >
                        Log Out
                    </button>
                </div>

                {/* Header */}
                <header className="mb-12 text-center">
                    <h2 className="text-4xl font-bold">Update Profile</h2>
                </header>


                {/*Update Profile*/}    
                <div className="min-h-screen flex flex-col justify-center items-center bg-black text-white p-4">
                    <h1 className="text-4xl font-bold text-center mb-8 text-red-500" >Update Profile</h1>

                    <form onSubmit={handlePasswordUpdate} className="bg-gray-900 p-8 rounded-lg shadow-xl w-full max-w-md space-y-8 border border-gray-800" >
                        <div className="flex flex-col">
                            <label htmlFor="email" className="text-lg text-gray-300 mb-2">Email: </label>
                            <input type="email" value={userEmail} disabled 
                                className="text-black px-4 py-3 border border-gray-700 rounded-lg bg-gray-100 focus:outline-none"/>
                        </div>

                        <div className="flex flex-col">
                            <label htmlFor="newPassword" className="text-lg text-gray-300 mb-2">New Password: </label>
                            <input type={showPassword ? 'text' : 'password'} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required 
                                className="text-black px-4 py-3 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"/>
                        </div>

                        <div className="flex flex-col">
                            <label htmlFor="confirmNewPassword" className="text-lg text-gray-300 mb-2">Confirm New Password: </label>
                            <input type={showPassword ? 'text' : 'password'} value={confirmNewPassword} onChange={(e) => setNewConfirmPassword(e.target.value)} required 
                                className="text-black px-4 py-3 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"/>
                        </div>

                        <div className='flex items-center'>
                            <input type="checkbox" id="showPassword" checked={showPassword} onChange={() => setShowPassword(!showPassword)}
                                className="mr-2" />
                            <label htmlFor="showPassword" className="text-lg text-gray-300">Show Password</label>
                        </div>

                        {error && <p className='text-red-500 text-center' aria-live="polite">{error}</p>}
                        {success && <p className='text-green-500 text-center' aria-live="polite">{success}</p>}

                        <button type='submit' className='w-full py-3 bg-red-500 text-black font-bold rounded-lg hover:bg-red-600 transition disabled:bg-gray-600 disabled:cursor-not-allowed'>Update Password</button>
                    </form>

                </div>

            </main>
        </div>
    );

}

export default UpdateProfile;