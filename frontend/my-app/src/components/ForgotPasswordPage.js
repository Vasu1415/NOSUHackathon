import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/20/solid';


function ForgotPasswordPage(){
    const [email, setEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setNewConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const navigate = useNavigate();


    const handleResetPassword = async (e) => {
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
            const response = await fetch ('http://127.0.0.1:5000/api/forgot-password', {
                method: 'POST',
                headers: {'Content-Type':'application/json'},
                body: JSON.stringify({email, new_password: newPassword}),
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

    return (
        <div className="min-h-screen flex flex-col justify-center items-center bg-black text-white p-4">
            {/*Back Button */}
            <button onClick={() => navigate('/login')} 
                className="absolute top-4 left-4 p-2 bg-gray-200 text-slate-950 rounded-full hover:bg-gray-300" >
                <ArrowLeftIcon className="h-6 w-6" />
            </button>
            
            <h1 className="text-4xl font-bold text-center mb-8" >Reset Password</h1>

            <form onSubmit={handleResetPassword} className="bg-gray-50 p-8 rounded-lg shadow-lg w-full max-w-md space-y-6" >
                <div className="flex flex-col">
                    <label htmlFor="email" className="text-lg text-gray-700 mb-2">Email: </label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required 
                        className="text-slate-950 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"/>
                </div>

                <div className="flex flex-col">
                    <label htmlFor="newPassword" className="text-lg text-gray-700 mb-2">New Password: </label>
                    <input type={showPassword ? 'text' : 'password'}value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required 
                        className="text-slate-950 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"/>
                </div>

                <div className="flex flex-col">
                    <label htmlFor="confirmNewPassword" className="text-lg text-gray-700 mb-2">Confirm New Password: </label>
                    <input type={showPassword ? 'text' : 'password'} value={confirmNewPassword} onChange={(e) => setNewConfirmPassword(e.target.value)} required 
                        className="text-slate-950 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"/>
                </div>

                <div className='flex items-center'>
                    <input type="checkbox" id="showPassword" checked={showPassword} onChange={() => setShowPassword(!showPassword)}
                        className="mr-2" />
                    <label htmlFor="showPassword" className="text-lg text-gray-700">Show Password</label>
                </div>

                {error && <p className='w-full py-3 text-red-500 '>{error}</p>}
                {success && <p className='text-green-600 text-center'>{success}</p>}

                <button type='submit' className='w-full py-3 bg-red-500 text-white font-bold rounded-lg hover:bg-red-500 disabled:bg-gray-400 disabled:cursor-not-allowed'>Reset Password</button>
            </form>
            

        </div>
    );

}

export default ForgotPasswordPage;