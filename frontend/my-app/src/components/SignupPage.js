import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';


function SignupPage(){
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

        const passwordStrengthRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;
        if (!passwordStrengthRegex.test(password)) {
            setError('Password must be at least 8 characters long, contain an uppercase letter, a number, and a special character.');
            return;
        }
        
        if (password !== confirmPassword){
            setError('Passwords do not match.');
            return;
        }
        
        

        const formData = new FormData();
        formData.append('email', email);
        formData.append('password', password);
        formData.append('confirm_password', confirmPassword);

        if (profilePicture){
            formData.append('profile_picture', profilePicture);
        }

        try {
            const response = await fetch('/api/signup', {
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
        }

    };

    return (
        <div className='min-h-screen flex flex-col justify-center items-center bg-slate-950 text-white p-4'>
            <h1 className="text-4xl font-bold text-center mb-8">Sign Up</h1>
            <form onSubmit={handleSignup} encType="multipart/form-data" className='bg-gray-50 p-8 rounded-lg shadow-lg w-full max-w-md space-y-6'>
                <div className='flex flex-col'>
                    <label htmlFor="email" className="text-lg text-gray-700 mb-2">Email: </label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required 
                        className="text-slate-950 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-600"/>
                </div>

                <div className='flex flex-col'>
                    <label htmlFor="password" className="text-lg text-gray-700 mb-2">Password: </label>
                    <input type={showPassword ? 'text' : 'password'}  value={password} onChange={(e) => setPassword(e.target.value)} required 
                        className="text-slate-950 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-600"/>
                </div>


                <div className='flex flex-col'>
                    <label htmlFor="confirmPassword" className="text-lg text-gray-700 mb-2">Confirm Password: </label>
                    <input type={showPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required
                        className="text-slate-950 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-600"/>
                </div>

                <div className='flex items-center'>
                    <input type="checkbox" id="showPassword" checked={showPassword} onChange={() => setShowPassword(!showPassword)}
                        className="mr-2" />
                    <label htmlFor="showPassword" className="text-lg text-gray-700">Show Password</label>
                </div>

                <div className='flex flex-col'>
                    <label htmlFor="profilePicture" className="text-lg text-gray-700 mb-2">Profile Picture: </label>
                    <input type="file" accept="image" onChange={(e) => setProfilePicture(e.target.files[0])} 
                        className="text-slate-950 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-600"/>
                </div>

                {error && <p className='w-full py-3 bg-rose-600 text-white'>{error}</p>}

                <button type='submit' className='w-full py-3 bg-rose-600 text-white font-bold rounded-lg hover:bg-rose-700 disabled:bg-gray-400 disabled:cursor-not-allowed'>
                    Sign Up
                </button>

            </form>

            <p className='text-center text-gray-300 mt-4'> Already a user?{' '}
                <span className='text-rose-600 cursor-pointer hover:text-rose-700' onClick={() => navigate('/login')}>Login</span>
            </p>
        </div>
    );

}

export default SignupPage;