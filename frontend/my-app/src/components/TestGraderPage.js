import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaTachometerAlt, FaFileAlt, FaFileUpload } from 'react-icons/fa'; // Import icons

const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <FaTachometerAlt /> },
    { name: 'Test Grader', path: '/test-grader', icon: <FaFileUpload /> },
    { name: 'Mini Test', path: '/mini-test', icon: <FaFileAlt /> },
];

function TestGrader (){
    const navigate = useNavigate();
    const [uploadedFile, setUploadedFile] = useState(null);
    const [selectedModel, setSelectedModel] = useState('');
    
    const [activeTab, setActiveTab] = useState('');
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);
    const [profilePicture, setProfilePicture] = useState('');
    const location = useLocation();
    const [error, setError] = useState(null);


    const handleNavigation = (path) => {
        navigate(path);
    };

    const handleFileUpload = (e) => {
        e.preventDefault();
        const file = e.target.files ? e.target.files[0] : e.dataTransfer.files[0];
        if (file){
            setUploadedFile(file);
            setError(null);
        }
    };

    const handleModelChange = (e) => {
        e.preventDefault();
        setSelectedModel(e.target.value);
        setError(null);
    };
    
    const handleSubmit = () => {
        if (!uploadedFile){
            setError('Please upload a document.');
        } else if (!selectedModel) {
            setError('Please select a model.');
        } else {
            setError(null);
            alert(`Document "${uploadedFile.name}" submitted with model "${selectedModel}".`);
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
                
                {/*Header */}
                <header className='mb-8 text-center'>
                    <h2 className="text-6xl font-bold text-center mt-20 text-white">Test Grader</h2>
                    <p className="text-gray-400 mt-2 text-center text-2xl">Upload your exams and get instant feedback.</p>

                </header>

                {/* Upload Container */}
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-rose-400 rounded-xl p-12 bg-rose-200 bg-opacity-15 w-full max-w-4xl min-h-[60vh] mx-auto" 
                    onDragOver={handleDragOver} onDrop={handleDrop}>
                    <p className='text-3xl font-bold mb-6 text-rose-700 '>Click to upload, or drag your PDF file here</p>

                    {/*File Upload */}
                    <input type='file' accept='.pdf' className='hidden' id='file-upload' onChange={handleFileUpload} />
                    <label htmlFor='file-upload' className='text-xl cursor-pointer px-10 py-4 bg-rose-600 text-white rounded-lg hover:bg-rose-700 font-bold'>Upload PDF</label>

                    {uploadedFile && (
                        <div className='mt-6 p-4 border border-gray-300 rounded-lg bg-gray-50 w-full max-w-lg'>
                            <p className='text-xl text-gray-600'>Uploaded File: </p>
                            <p className='text-gray-800 font-medium'>{uploadedFile.name}</p>
                        </div>
                    )}
                

                    {/*Model Section*/ }
                    <div className='mt-8 w-full max-w-md flex flex-col items-center pt-10'>
                        <lable htmlFor='model-select' className='block text-3xl mb-4 text-rose-700 font-bold'>
                            Select Model for Feedback:
                        </lable>
                        <select id='model-select' value={selectedModel} onChange={handleModelChange} 
                            className='w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 foucs:ring-rose-600 font-bold'>

                            <option value="">-- Select a model --</option>
                            <option value="model-1">Model 1</option>
                            <option value="model-2">Model 2</option>
                            <option value="model-3">Model 3</option>
                            {/*ADD LEGIT MODEL OPTIONS HERE */}
                        </select>
                    </div>

                   

                    {/* Submit Button */}
                    <button onClick={handleSubmit} 
                        className='text-xl mt-8 px-10 py-4 bg-rose-600 text-white rounded-lg hover:bg-rose-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-bold'
                        disabled={!uploadedFile || !selectedModel}>
                        Submit
                    </button>


                    {/*Error Message */}
                    {error && (
                        <div className='mt-4 p-4 text-red-700 bg-red-100 border border-red-300 rounded-lg'>
                            {error}
                        </div>
                    )}

                </div>




            </main>
        </div>
    );
}
export default TestGrader;