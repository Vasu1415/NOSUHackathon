import React from 'react';
import { useNavigate} from 'react-router-dom';

function OpeningPage(){
  const navigate = useNavigate();

  const handleGetStarted = () =>{
    navigate('/signup'); // navigate to signup page
  };

  return (
    <div className='min-h-screen flex flex-col justify-center items-center bg-slate-950 text-white'>
      <h1 className='text-6xl font-bold mb-8 text-center'> Welcome to Study Buddy</h1>
      <p className='text-2xl text-gray-400 mb-16 text-center'> Your AI powered study tool to help you ace exams!</p>
      <button className='px-10 py-4 bg-rose-600 text-white rounded-lg hover:bg-rose-700 text-xl' onClick={handleGetStarted}>
        Get Started
      </button>
    </div>
  );
}

export default OpeningPage;
