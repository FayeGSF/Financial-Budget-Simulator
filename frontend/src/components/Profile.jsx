import React, { useState, useEffect } from 'react';
import { FaEdit, FaTimes } from 'react-icons/fa';
import api from '../api/auth';
import FixedExpense from './FixedExpense';
import Income from './Income';

function Profile () {
// state management
// 1. profile data
// 2. isEditingProfile
// 3. loading state
//4. error state
// 5. profile form data
// 6. success message 
    const [profileData, setProfileData] = useState(null);
    const [EditingProfile, setEditingProfile] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [ showProfileForm, setShowProfileForm]= useState(false);
    const [successMessage, setSuccessMessage] = useState('')
    const [profileForm, setProfileForm] = useState({
        username: '',
        firstname: '',
        lastname: '',
        email: '',
        old_password: '',
        new_password: '',
        confirm_new_password: ''
    });

// use effect

useEffect (() => { 
    fetchProfileData ()
}, []);

// functions for fetching profile data
    const fetchProfileData = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.get('/user/profile', {
                withCredentials: true
            })
            setProfileData(response.data.data || {});
            // set form data 
            setProfileForm({
                username: response.data.data.username,
                firstname: response.data.data.firstname,
                lastname: response.data.data.lastname,
                email: response.data.data.email,
                old_password: '',
                new_password: '',
                confirm_new_password: ''
            })
        } catch (error) {
            setError(error.response.data.error || 'Failed to fetch profile data');
        } finally {
            setLoading(false);
        }
    }

// function to handle profile update
const handleProfileUpdate = async (e) => {
    e.preventDefault(e);
    try {
        setError(null)
        setSuccessMessage ('')
        // submit the form data to the backend
        const response = await api.put('user/update', profileForm, {
            withCredentials: true
        })
        //  if successfull, update profile and show success message
        // set the editing profile to false and show the updated data
        setSuccessMessage('Profile updated successfully');
        setEditingProfile(false);
        // Update profile data directly without refetching
        setProfileData(prevData => ({
            ...prevData,
            ...profileForm
        }));
        // Clear password fields after successful update
        setProfileForm(prev => ({
            ...prev,
            old_password: '',
            new_password: '',
            confirm_new_password: ''
        }));
        // clear the success message after 3 seconds
        setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
        console.error('Error updating profile:', err);
        setError(err.response.data.error || 'Failed to update profile');
        // clear the error message after 5 seconds
        setTimeout(() => setError(null), 3000);
    } finally {
        setLoading(false);
    } 
}

const handleInputChange = (field, value) => {
    setProfileForm(prev => ({
        ...prev,
        [field]: value
    }));
}

const handleCancelEdit = () => {
    // Clear password fields when canceling edit
    setProfileForm(prev => ({
        ...prev,
        old_password: '',
        new_password: '',
        confirm_new_password: ''
    }));
    setEditingProfile(false);
} 

    return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-lime-900 to-lime-700 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-white">{profileData?.username || 'User'}'s Profile</h2>
                        <p className="text-blue-100 mt-1">Manage your account information</p>
                     </div>
                     <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                            <button 
                                onClick={() => setEditingProfile(!EditingProfile)} 
                                className="inline-flex items-center justify-center px-3 sm:px-4 py-2 border border-transparent text-sm 
                                font-medium rounded-md text-blue-600 bg-white hover:bg-blue-500 hover:text-white transition-colors duration-200"
                            >
                               {EditingProfile ? <FaTimes className ="mr-2" /> : <FaEdit className = "mr-2" />}
                               {EditingProfile ? 'Cancel' : 'Edit Profile'}
                            </button>
                        </div>
                 </div>
             </div>
             {/* Content */}
             <div className="px-6 py-8">
                {successMessage && (
                    <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
                        <p className="text-sm font-medium text-green-800">{successMessage}</p>
                    </div>
                )}
                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
                        <h3 className="text-sm font-medium text-red-800">Error</h3>
                        <div className="mt-2 text-sm text-red-700">{error}</div>
                    </div>
                )}
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        <span className="ml-3 text-gray-600">Loading profile...</span>
                    </div>
                ) : (
                    <div>
                    {EditingProfile ? (
                        // Show edit form
                        <form onSubmit={handleProfileUpdate} className="space-y-6">
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Username <span className="text-red-500">*</span>
                                    </label>
                                    <input 
                                        type="text" 
                                        value={profileForm.username} 
                                        onChange={(e) => handleInputChange('username', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
                                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Enter username"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email <span className="text-red-500">*</span>
                                    </label>
                                    <input 
                                        type="email" 
                                        value={profileForm.email} 
                                        onChange={(e) => handleInputChange('email', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm
                                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Enter email"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        First Name <span className="text-red-500">*</span>
                                    </label>
                                    <input 
                                        type="text" 
                                        value={profileForm.firstname} 
                                        onChange={(e) => handleInputChange('firstname', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
                                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Enter first name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Last Name <span className="text-red-500">*</span>
                                    </label>
                                    <input 
                                        type="text" 
                                        value={profileForm.lastname} 
                                        onChange={(e) => handleInputChange('lastname', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Enter last name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Current Password <span className="text-gray-500 text-xs">(optional)</span>
                                    </label>
                                    <input 
                                        type="password" 
                                        value={profileForm.old_password} 
                                        onChange={(e) => handleInputChange('old_password', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Enter new password (optional)"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        New Password <span className="text-gray-500 text-xs">(optional)</span>
                                    </label>
                                    <input 
                                        type="password" 
                                        value={profileForm.new_password} 
                                        onChange={(e) => handleInputChange('new_password', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Enter new password (optional)"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Confirm New Password <span className="text-gray-500 text-xs">(optional)</span>
                                    </label>
                                    <input 
                                        type="password" 
                                        value={profileForm.confirm_new_password} 
                                        onChange={(e) => handleInputChange('confirm_new_password', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Confirm new password"
                                    />
                                </div>
                            </div>
                            
                            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                                <button 
                                    type="submit"
                                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    Update Profile
                                </button>
                            </div>
                        </form>
                    ):(
                    // Show read-only display if not editing mode
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <div className="bg-gray-50 px-4 py-3 rounded-lg">
                                <dt className="text-sm font-medium text-gray-500">Username</dt>
                                <dd className="mt-1 text-sm text-gray-900">{profileData?.username || 'Not provided'}</dd>
                            </div>
                            <div className="bg-gray-50 px-4 py-3 rounded-lg">
                                <dt className="text-sm font-medium text-gray-500">Email</dt>
                                <dd className="mt-1 text-sm text-gray-900">{profileData?.email || 'Not provided'}</dd>
                            </div>
                            <div className="bg-gray-50 px-4 py-3 rounded-lg">
                                <dt className="text-sm font-medium text-gray-500">First Name</dt>
                                <dd className="mt-1 text-sm text-gray-900">{profileData?.firstname || 'Not provided'}</dd>
                            </div>
                            <div className="bg-gray-50 px-4 py-3 rounded-lg">
                                <dt className="text-sm font-medium text-gray-500">Last Name</dt>
                                <dd className="mt-1 text-sm text-gray-900">{profileData?.lastname || 'Not provided'}</dd>
                            </div>
                        </div>
                    </div>
                        )}
                    </div>
                        )}
                    </div>
                </div>
        
                {/* Income Section */}
                <div id="income-section" className="mt-8">
                 <Income />
                </div>
                
                {/* Fixed Expense Section */}
                <div id="fixed-expenses-section" className="mt-8">
                    <FixedExpense />
                </div>
            </div>
        </div>
   
    );
}

export default Profile