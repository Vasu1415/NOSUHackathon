import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaTachometerAlt, FaFileAlt, FaFileUpload } from 'react-icons/fa'; // Import icons

const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <FaTachometerAlt /> },
    { name: 'Test Grader', path: '/test-grader', icon: <FaFileUpload /> },
    { name: 'Mini Test', path: '/mini-test', icon: <FaFileAlt /> },
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
                            onClick={toggleProfileMenu} />

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


                {/*Update Profile*/}    
                <div className="min-h-screen flex flex-col justify-center items-center bg-slate-950 text-white p-4">
                    <h1 className="text-4xl font-bold text-center mb-8" >Update Profile</h1>

                    <form onSubmit={handlePasswordUpdate} className="bg-gray-50 p-8 rounded-lg shadow-lg w-full max-w-md space-y-6" >
                        <div className="flex flex-col">
                            <label htmlFor="email" className="text-lg text-gray-700 mb-2">Email: </label>
                            <input type="email" value={userEmail} disabled 
                                className="text-slate-950 px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 focus:outline-none "/>
                        </div>

                        <div className="flex flex-col">
                            <label htmlFor="newPassword" className="text-lg text-gray-700 mb-2">New Password: </label>
                            <input type={showPassword ? 'text' : 'password'}value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required 
                                className="text-slate-950 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-600"/>
                        </div>

                        <div className="flex flex-col">
                            <label htmlFor="confirmNewPassword" className="text-lg text-gray-700 mb-2">Confirm New Password: </label>
                            <input type={showPassword ? 'text' : 'password'} value={confirmNewPassword} onChange={(e) => setNewConfirmPassword(e.target.value)} required 
                                className="text-slate-950 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-600"/>
                        </div>

                        <div className='flex items-center'>
                            <input type="checkbox" id="showPassword" checked={showPassword} onChange={() => setShowPassword(!showPassword)}
                                className="mr-2" />
                            <label htmlFor="showPassword" className="text-lg text-gray-700">Show Password</label>
                        </div>

                        {error && <p className='text-red-600 text-center'>{error}</p>}
                        {success && <p className='text-green-600 text-center'>{success}</p>}

                        <button type='submit' className='w-full py-3 bg-rose-600 text-white font-bold rounded-lg hover:bg-rose-700 disabled:bg-gray-400 disabled:cursor-not-allowed'>Update Password</button>
                    </form>

                </div>

            </main>
        </div>
    );

}

export default UpdateProfile;