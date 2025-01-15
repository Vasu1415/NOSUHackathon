import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';


function SignupPage(){
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [profilePicture, setProfilePicture] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();


    const handleSignup = async (e) => {
        e.preventDefault();
        setError(null);

        if (password !== confirmPassword){
            setError('Passwords do not match.');
            return;
        }

        const passwordStrengthRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()\-_=+\\|[\]{};:/?.>]).{8,}$/;
        if (!passwordStrengthRegex.test(password)) {
            setError('Password must be at least 8 characters long, contain an uppercase letter, a number, and a special character.');
            return;
        }
        
       
        
        

        const formData = new FormData();
        formData.append('first_name', firstName);
        formData.append('last_name', lastName); 
        formData.append('email', email);
        formData.append('password', password);
        //formData.append('confirm_password', confirmPassword);

        console.log(firstName);
        console.log(lastName);
        console.log(email);
        console.log(password);


        if (profilePicture){
            formData.append('profile_picture', profilePicture);
        }

        try {
            const response = await fetch('http://127.0.0.1:5000/api/signup', {
                method: 'POST',
                body: formData,
            });

            if (response.status === 201){
                alert('Signup successful!');
                navigate('/login');
            } else {
                const data = await response.json();
                setError(data.message || 'Error signing up. Please try again');
            }
        } catch (err) {
            setError('Unexpected error occurred.');
            console.error(err);
        }

    };

    return (
        <div className='min-h-screen flex flex-col justify-center items-center bg-black text-white p-4'>
            <h1 className="text-4xl font-bold mb-4">Register With Us</h1>
            
            <form onSubmit={handleSignup} encType="multipart/form-data" className='bg-gray-50 p-8 rounded-lg shadow-lg w-full max-w-3xl space-y-6'>

                <div className='flex flex-col md:flex-row md:space-x-6'>
                    <div className='flex-1 flex flex-col'>
                        <label htmlFor="firstName" className="text-lg text-gray-700 mb-2">First Name: </label>
                        <input type="text"  value={firstName}  onChange={(e) => setFirstName(e.target.value)} required 
                            className="text-slate-950 px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" />
                    </div>

                    <div className='flex-1 flex flex-col'>
                        <label htmlFor="lastName" className="text-lg text-gray-700 mb-2">Last Name: </label>
                        <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} required 
                            className="text-slate-950 px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" />
                    </div>
                </div>
                

                <div className='flex flex-col'>
                    <label htmlFor="email" className="text-lg text-gray-700 mb-2">Email: </label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required 
                        className="text-slate-950 px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"/>
                </div>

                <div className='flex flex-col md:flex-row md:space-x-6'>
                    <div className='flex-1 flex flex-col'>
                        <label htmlFor="password" className="text-lg text-gray-700 mb-2">Password: </label>
                        <input type={showPassword ? 'text' : 'password'}  value={password} onChange={(e) => setPassword(e.target.value)} required 
                            className="text-slate-950 px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"/>
                    </div>


                    <div className='flex-1 flex flex-col'>
                        <label htmlFor="confirmPassword" className="text-lg text-gray-700 mb-2">Confirm Password: </label>
                        <input type={showPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} 
                            className="text-slate-950 px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"/>
                    </div>
                </div>

                

                <div className='flex items-center'>
                    <input type="checkbox" id="showPassword" checked={showPassword} onChange={() => setShowPassword(!showPassword)}
                        className="mr-2" />
                    <label htmlFor="showPassword" className="text-lg text-gray-700">Show Password</label>
                </div>

                <div className='flex flex-col'>
                    <label htmlFor="profilePicture" className="text-lg text-gray-700 mb-2">Profile Picture: </label>
                    <input type="file" accept="image" onChange={(e) => setProfilePicture(e.target.files[0])} 
                        className="text-slate-950 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"/>
                </div>

                {error && <p className='w-full py-3 text-red-500 '>{error}</p>}

                <button type='submit' className='w-full py-3 bg-red-500 text-white font-bold rounded-lg hover:bg-red-500 disabled:bg-gray-400 disabled:cursor-not-allowed'>
                    Sign Up
                </button>

            </form>

            <p className='text-center text-gray-300 mt-4 font-bold text-2xl'> Already a user?{' '}
                <span className='text-red-500 cursor-pointer hover:text-red-500' onClick={() => navigate('/login')}>Login</span>
            </p>
        </div>
    );

}

export default SignupPage;