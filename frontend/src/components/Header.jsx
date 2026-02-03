import logoWhiteText from '../static/logoWhiteText.png';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import React, { memo, useState } from 'react';
import { CgProfile } from "react-icons/cg";
import { FaChevronDown } from "react-icons/fa";



const Header = memo(function Header({user}) {
  const location = useLocation();
 
  const navigate = useNavigate()
  const [isProfileOpen, setIsProfileOpen] = useState(false)

  // function to go to profile section
  // scroll to section when the link is clicked in the dropdown 
  const goToProfileSection = (sectionId) => {
    setIsProfileOpen(false)
    navigate('/profile')
    setTimeout(() => {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 100);
  };



  return (
    <header className="flex items-center justify-between bg-lime-900 px-4 sm:px-8 lg:px-12 h-20 sm:h-28">
        <div className="flex items-center">
        {(user === null  || user === undefined) ? (
          <Link to="/">
            <img className="w-32 h-16 sm:w-64 sm:h-60 object-contain" src={logoWhiteText} alt="logo" />
          </Link>) :( 
            <Link to="/dashboard">
            <img className="w-32 h-16 sm:w-64 sm:h-60 object-contain" src={logoWhiteText} alt="logo" />
          </Link>
          )}
        </div>
        <nav className="flex flex-wrap items-center gap-1 md:gap-2 lg:gap-4 xl:gap-8 pr-2 sm:pr-4">
          {(user === null  || user === undefined) ? (
            <>
            <Link to="/register" className="text-white hover:text-gray-300 text-xs md:text-sm lg:text-base font-semibold">Register</Link>
            <Link to="/login" className="text-white hover:text-gray-300 text-xs md:text-sm lg:text-base font-semibold ">Login</Link>
           </>
            
          ) : (
            <>
                <Link to="/dashboard" className="text-white hover:text-gray-300 text-xs md:text-sm lg:text-base font-semibold ">Dashboard</Link>
                <Link to="/whatif" className="text-white hover:text-gray-300 text-xs md:text-sm lg:text-base font-semibold ">Scenario Playground</Link>
                <Link to="/expenses"  className="text-white hover:text-gray-300 text-xs md:text-sm lg:text-base font-semibold ">Expenses</Link>
                <Link to="/goals" className="text-white hover:text-gray-300 text-xs md:text-sm lg:text-base font-semibold ">Goals</Link>
                <Link to="/savings" className="text-white hover:text-gray-300 text-xs md:text-sm lg:text-base font-semibold ">Savings</Link>
                <div className="relative">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="text-white hover:text-gray-300 text-xs md:text-sm lg:text-base font-semibold"
                  >
                    <CgProfile className="inline text-lg md:text-xl lg:text-2xl" /> <FaChevronDown className ="inline text-xs md:text-sm" />
                  </button>
                  
                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-40 bg-white rounded shadow-lg py-1 z-50">
                      <Link
                        to="/profile"
                        onClick={() => setIsProfileOpen(false)}
                        className="block w-full text-center px-4 py-2 text-md font-semibold text-gray-700 hover:bg-gray-100">
                        Profile
                      </Link>
                      <button
                        onClick={() => goToProfileSection('income-section')}
                        className="block w-full text-center px-4 py-2 text-md font-semibold text-gray-700 hover:bg-gray-100">
                        Income
                      </button>
                      <button
                        onClick={() => goToProfileSection('fixed-expenses-section')}
                        className="block w-full text-center px-4 py-2 text-md font-semibold text-gray-700 hover:bg-gray-100">
                        Fixed Expenses
                      </button>
                      
                    </div>
                  )}
                </div>
                <Link to="/logout" className="text-white hover:text-gray-300 text-xs md:text-sm lg:text-base font-semibold ">Logout</Link>
            </>
          )}
        </nav>

    </header>
  );
});

export default Header;
