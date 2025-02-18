import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './layout/Layout';
import Dashboard from './component/Dashboard';
import Users from './component/users';
import './style/style.css'
import Posts from './component/Posts';
import Signin from './auth/Signin';




const App = () => {
  return (
    <Router>
      <Routes>
        {/* Signin nằm ngoài Layout */}
        <Route path="/signin" element={<Signin />} />
        {/* Các trang bên trong Layout */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="posts" element={<Posts />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
