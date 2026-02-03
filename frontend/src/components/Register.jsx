import React, { useState } from 'react';
import { registerUser } from '../api/auth';
import { useNavigate } from 'react-router-dom';


function Register() {
    const[formData,setFormData] = useState ({
        username: '',
        firstname:'',
        lastname:'',
        email:'',
        password:'',
        confirm_password: ''
    })

    const [errorMessage, setErrorMessage ] = useState ('')
    const [fieldErrors, setFieldErrors] = useState({})
    const[successMessage, setSuccessMessage] = useState ('')
    const navigate = useNavigate();
    const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

   const handleSubmit = async (e) => {
    // preventdefault prevent the page from loading, as the user submission must be processed first
    e.preventDefault();
    
    // Clear previous errors
    setErrorMessage('');
    setFieldErrors({});
    setSuccessMessage('');
    
    try {
      const res = await registerUser(formData);
      
      // Check if registration was successful
      if (res.message && res.message.includes('successfully')) {
        // Clear form data
        setFormData({
          username: '',
          firstname:'',
          lastname:'',
          email:'',
          password:'',
          confirm_password: ''
        });
        
        // Set success message
        setSuccessMessage('Registration successful! Redirecting to login...');
        
        // Navigate to login after a short delay to show success message
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      } else {
        // Handle unexpected response
        setErrorMessage(res.message || 'Registration completed but with unexpected response');
      }
      
    } catch (error) {
      // Handle field-specific errors
      if (error.response?.data?.errors) {
        setFieldErrors(error.response.data.errors);
      } else {
        // Handle generic error
        setErrorMessage(error.response?.data?.error || 'Registration failed');
      }
    }
  };

    return ( 
        <div className="min-h-screen bg-gray-50 py-4 sm:py-6 lg:py-8 px-3 sm:px-4 lg:px-6 xl:px-8">
          <div className="max-w-3xl mx-auto">
          {/* <div className="bg-white shadow-lg rounded-lg overflow-hidden mb-4 sm:mb-6 lg:mb-8"> */}
            {/* <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-4 sm:px-6 py-4 sm:py-6"> */}
                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-zinc-600 text-center">Register</h2>
                    <p className="text-zinc-600 mt-1 text-sm sm:text-base text-center">Create an account</p>
                </div>
            {errorMessage && (
              <div className="mb-4 sm:mb-6 bg-red-50 border border-red-200 rounded-md p-3 sm:p-4">
                  <div className="flex">
                      <div className="ml-3">
                          <p className="text-sm font-medium text-red-800">{errorMessage}</p>
                      </div>
                  </div>
              </div>
          )}
          
          {successMessage && (
            <div className="mb-4 sm:mb-6 bg-green-50 border border-green-200 rounded-md p-3 sm:p-4">
                <div className="flex">
                    <div className="ml-3">
                        <p className="text-sm font-medium text-green-800">{successMessage}</p>
                    </div>
                </div>
            </div>
        )}
            <form onSubmit={handleSubmit}  className="flex flex-col space-y-4 max-w-md mx-auto mt-4 mb-4">
              <div>
                <label className="text-sm font-medium text-gray-700"> Username: </label>
                <input 
                  name="username" 
                  placeholder="Username" 
                  onChange={handleChange}  
                  className={`p-2 border-2 rounded w-full ${fieldErrors.username ? 'border-red-500' : 'border-stone-300'}`}
                />
                {fieldErrors.username && (
                  <p className="text-red-500 text-sm mt-1">{fieldErrors.username}</p>
                )}
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700"> First name: </label>
                <input 
                  name="firstname" 
                  placeholder="First name" 
                  onChange={handleChange} 
                  className="p-2 border-2 rounded border-stone-300 w-full" 
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700"> Last name: </label>
                <input 
                  name="lastname" 
                  placeholder="Last name" 
                  onChange={handleChange}  
                  className="p-2 border-2 rounded border-stone-300 w-full"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700"> Email: </label>
                <input 
                  name="email" 
                  placeholder="Email" 
                  onChange={handleChange} 
                  className={`p-2 border-2 rounded w-full ${fieldErrors.email ? 'border-red-500' : 'border-stone-300'}`}
                />
                {fieldErrors.email && (
                  <p className="text-red-500 text-sm mt-1">{fieldErrors.email}</p>
                )}
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700"> Password: </label>
                <input 
                  name="password" 
                  placeholder="Password" 
                  type="password" 
                  onChange={handleChange} 
                  className={`p-2 border-2 rounded w-full ${fieldErrors.password ? 'border-red-500' : 'border-stone-300'}`}
                />
                {fieldErrors.password && (
                  <p className="text-red-500 text-sm mt-1">{fieldErrors.password}</p>
                )}
              </div>
               <div>
                <label className="text-sm font-medium text-gray-700"> Confirm Password: </label>
                <input 
                  name="confirm_password" 
                  placeholder="confirm Password" 
                  type="password" 
                  onChange={handleChange} 
                  className={`p-2 border-2 rounded w-full ${fieldErrors.password ? 'border-red-500' : 'border-stone-300'}`}
                />
                {fieldErrors.password && (
                  <p className="text-red-500 text-sm mt-1">{fieldErrors.password}</p>
                )}
              </div>
              
              <button type="submit" className="bg-lime-900 text-white font-semibold py-2 rounded hover:bg-lime-800">Register</button>
            </form>
            {/* </div> */}
            {/* </div> */}
        </div>
    )

}

export default Register