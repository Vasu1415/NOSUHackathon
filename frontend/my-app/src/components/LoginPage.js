import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';


function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();


    const handleLogin = async (e) => {
        e.preventDefault();
        setError(null);


        try {
            const response = await fetch('http://127.0.0.1:5000/api/login', {
                method: 'POST', 
                headers: {'Content-Type': 'application/josn'},
                body: JSON.stringify({email, password}),
            });

            if (response.status === 200){
                //const data = await response.json();
                alert('Login successful!');
                navigate('/dashboard'); // redirect to the dashboard
            } else {
                const data = await response.json();
                setError(data.message || 'Invalid email or password.')
            }
        } catch (err) {
            setError('Unexpected error occured.');
        }
    };

    return (
        <div className='min-h-screen flex flex-col justify-center items-center bg-slate-950 text-white p-4'>
            <h1 className="text-4xl font-bold text-center mb-8">Login</h1>

            <form onSubmit={handleLogin} className="bg-gray-50 p-8 rounded-lg shadow-lg w-full max-w-md space-y-6">
                <div className="flex flex-col">
                    <label htmlFor="email" className="text-lg text-gray-700 mb-2">Email: </label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required 
                        className="text-slate-950 px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-600"/>
                </div>

                <div className="flex flex-col">
                    <label htmlFor="password" className="text-lg text-gray-700 mb-2">Password: </label>
                    <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required 
                        className="text-slate-950 px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-600" />
                </div>

                <div className='flex items-center'>
                    <input type="checkbox" id="showPassword" checked={showPassword} onChange={() => setShowPassword(!showPassword)}
                        className="mr-2" />
                    <label htmlFor="showPassword" className="text-lg text-gray-700">Show Password</label>
                </div>

                {error && <p  className="text-red-600 text-center">{error}</p>}

                <button type='submit' className="w-full py-3 bg-rose-600 text-white font-bold rounded-lg hover:bg-rose-700 disabled:bg-gray-400 disabled:cursor-not-allowed">
                    Login
                </button>

            </form>

            <p className="text-center text-gray-300 mt-4 font-semibold text-xl">Forget your password?{' '}
                <span className="text-rose-600 cursor-pointer hover:text-rose-700" onClick={() =>navigate('/forgot-password')}>Reset Password</span>
            </p>

        </div>
    );
}

export default LoginPage;