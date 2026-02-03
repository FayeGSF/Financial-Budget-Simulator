import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import React, { useState, useEffect } from "react";
import "./App.css";
import axios from "axios";
// components
import Header from "./components/Header";
import Footer from "./components/Footer";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import Homepage from "./components/Homepage";
import Logout from "./components/Logout";
import Profile from "./components/Profile";
import Goals from "./components/Goals";
import Expenses from "./components/Expenses";
import Savings from "./components/Savings";
import Whatif from "./components/Whatif";
import CompletedGoals from "./components/CompletedGoals";

function App() {

  // user = null if not logged in
  const [user, setUser] = useState(null);
  // let App JS be the source of truth for dashboard data, it can pass on to other components
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [amountLeft, setAmountLeft] = useState(0);
  const [showCompletedGoals, setShowCompletedGoals] = useState(false);

  //  when initilizing app 
  useEffect(() => {
    const initializeApp = async () => {
      try {
        setIsLoading(true);
        const apiBaseURL = process.env.REACT_APP_API_URL;
        const sessionResponse = await axios.get(`${apiBaseURL}/auth/session-check`, {
          withCredentials: true,
        });
        
        console.log("Session response:", sessionResponse);
        
        if (sessionResponse.data.authenticated) {
          setUser(sessionResponse.data.session_data);
          
          // Fetch dashboard data 
          await fetchDashboardData();
        } else {
          setUser(null);
          setDashboardData(null);
        }
      } catch (error) {
        console.error("Error Initializing App", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  // Fetch dashboard data when user changes
  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  // Function to fetch dashboard data
  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const apiBaseURL = process.env.REACT_APP_API_URL;
      const response = await axios.get(`${apiBaseURL}/api/dashboard`, {
        withCredentials: true,
      });
      console.log("Dashboard data:", response.data);
      setDashboardData(response.data);
      
      // Also fetch remaining amount
      await fetchRemainingAmount();
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setDashboardData(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to fetch remaining amount
  const fetchRemainingAmount = async (month = null) => {
    try {
      const apiBaseURL = process.env.REACT_APP_API_URL;
      const response = await axios.get(`${apiBaseURL}/expenses/amount_left`, {
        withCredentials: true,
        params: month ? { month } : {}
      });
      setAmountLeft(response.data.remaining_amount);
    } catch (error) {
      console.error("Error fetching remaining amount:", error);
      setAmountLeft(0);
    }
  };


const sessionData = user;
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Header user={user} />
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/login" element={<Login setUser={setUser}/>} />
          <Route path ="/dashboard" element ={<Dashboard sessionData ={sessionData} 
          dashboardData={dashboardData} onReload={fetchDashboardData} isLoading={isLoading}
          amountLeft={amountLeft} />} />
          <Route path="/register" element ={<Register />} />
          <Route path="/logout" element={<Logout setUser={setUser} />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/goals" element={
            showCompletedGoals ? (
              <CompletedGoals 
                dashboardData={dashboardData} 
                onBack={() => setShowCompletedGoals(false)} 
              />
            ) : (
              <Goals 
                goals={dashboardData?.goal_progress || []} 
                goalProgress={dashboardData?.goal_progress || []} 
                isLoading={isLoading}
                dashboardData={dashboardData}
                onGoalUpdate={fetchDashboardData}
                onViewCompletedGoals={() => setShowCompletedGoals(true)}
              />
            )
          } />
          <Route path="/expenses" element={<Expenses amountLeft={amountLeft} fetchRemainingAmount={fetchRemainingAmount} />} />
          <Route path="/savings" element={<Savings dashboardData={dashboardData} onGoalUpdate={fetchDashboardData} />} />
          <Route path ="/whatif" element ={<Whatif amountLeft={amountLeft}/>} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
