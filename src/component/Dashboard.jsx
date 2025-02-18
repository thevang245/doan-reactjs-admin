import React, { useEffect, useState } from 'react';

function Dashboard() {
  const [dashboardData, setDashboardData] = useState({ totalUsers: 0, totalProducts: 0 });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/dashboard');
        const data = await response.json();
        setDashboardData(data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    fetchDashboardData();
  }, []);
  return (<>
    <>
      <div className="grid w-full grid-cols-1 gap-4 mt-4 xl:grid-cols-2 2xl:grid-cols-3">
      <div className="items-center justify-between p-4 bg-white border border-gray-200 rounded-lg shadow-sm sm:flex dark:border-gray-700 sm:p-6 dark:bg-gray-800">
        <div className="w-full">
          <h3 className="text-base font-normal text-gray-500 dark:text-gray-400">
            Tổng số người dùng
          </h3>
          <span className="text-2xl font-bold leading-none text-gray-900 sm:text-3xl dark:text-white">
            {dashboardData.totalUsers} người 
          </span>
        </div>
      </div>
      <div className="items-center justify-between p-4 bg-white border border-gray-200 rounded-lg shadow-sm sm:flex dark:border-gray-700 sm:p-6 dark:bg-gray-800">
        <div className="w-full">
          <h3 className="text-base font-normal text-gray-500 dark:text-gray-400">
            Tổng số bài đăng
          </h3>
          <span className="text-2xl font-bold leading-none text-gray-900 sm:text-3xl dark:text-white">
            {dashboardData.totalProducts} bài đăng 
          </span>
        </div>
      </div>
    </div>
    </>

  </>);
}

export default Dashboard;