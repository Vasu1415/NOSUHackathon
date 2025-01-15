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
      
        const formData = new FormData();
        formData.append('email', email);
        formData.append('password', password);
        formData.append('csrf_token', 'ImNzcmYtdG9rZW4i.X8ByBw.xb7r6h9-tZBXwBpvtHoQ94TPwNc'); // Use the static token
      
        try {
          const response = await fetch('http://127.0.0.1:5000/api/login', {
            method: 'POST',
            body: formData,
          });
      
          if (response.status === 200) {
            alert('Login successful!');
            navigate('/dashboard');
          } else {
            const data = await response.json();
            setError(data.message || 'Invalid email or password.');
          }
        } catch (err) {
          setError('Unexpected error occurred.');
          console.log(err);
        }
      };

    return (
        <div className='min-h-screen flex flex-col justify-center items-center bg-black text-white p-4'>
            <h1 className="text-4xl font-bold text-center mb-8">Login</h1>

            <form onSubmit={handleLogin} className="bg-gray-50 p-8 rounded-lg shadow-lg w-full max-w-md space-y-6">
                <div className="flex flex-col">
                    <label htmlFor="email" className="text-lg text-gray-700 mb-2">Email: </label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required 
                        className="text-slate-950 px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"/>
                </div>

                <div className="flex flex-col">
                    <label htmlFor="password" className="text-lg text-gray-700 mb-2">Password: </label>
                    <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required 
                        className="text-slate-950 px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" />
                </div>

                <div className='flex items-center'>
                    <input type="checkbox" id="showPassword" checked={showPassword} onChange={() => setShowPassword(!showPassword)}
                        className="mr-2" />
                    <label htmlFor="showPassword" className="text-lg text-gray-700">Show Password</label>
                </div>

                {error && <p  className="text-red-600 text-center">{error}</p>}

                <button type='submit' className="w-full py-3 bg-red-500 text-white font-bold rounded-lg hover:bg-red-500 disabled:bg-gray-400 disabled:cursor-not-allowed">
                    Login
                </button>

            </form>

            <p className="text-center text-gray-300 mt-4 font-semibold text-xl">Forget your password?{' '}
                <span className="text-red-500 cursor-pointer hover:text-red-500" onClick={() =>navigate('/forgot-password')}>Reset Password</span>
            </p>

        </div>
    );
}

export default LoginPage;