import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

function Login ({setUser}) {
    const navigate = useNavigate();

    const [formData, setFormData]= useState (
        {username:'',
          password:''
        }
    )

    const [message, setMessage ] = useState ('')

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        const apiBaseURL = process.env.REACT_APP_API_URL;
        const res = await axios.post(`${apiBaseURL}/auth/login`, formData, {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        });
        console.log("Login response:", res.data);
        if (res.data.user) {            // Check if backend sent user data (successful login)
          setUser(res.data.user);       
          setFormData({username:'', password:''})
          
          // Redirect to dashboard after successful login
          navigate('/dashboard', { replace: true });
        } else {
          setMessage(res.data.message || 'Login failed');
        }
      } catch (error) {
        console.error("Login error:", error);
        setMessage(error.response?.data?.error || 'Login failed');
      }
    };

    const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    };


    return (
    <>
    <p className="flex justify-center item-center font-bold text-3xl pt-10 text-zinc-600">Login</p>
    
    <form onSubmit={handleSubmit} className="flex flex-col space-y-4 max-w-md mx-auto mt-10 ">
      <input
        type="username"
        name="username"
        placeholder="Username"
        value={formData.username}
        onChange={handleChange}
        className="p-2 border-2 rounded border-stone-300"
        required
      />
      <input
        type="password"
        name="password"
        placeholder="Password"
        value={formData.password}
        onChange={handleChange}
        className="p-2 border-2 border-stone-300 rounded"
        required
      />
      <button type="submit" className="bg-lime-900 text-white font-semibold py-2 rounded hover:bg-lime-800">
        Login
      </button>
      {message && (
        <p className="text-red-600">
          {message}
        </p>
      )}
    </form>
    </>
  );
}
   


export default Login