import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import {
  Box, Container, Paper, Typography, Tabs, Tab, Button
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LogoutIcon from '@mui/icons-material/Logout';
import ProfileManagement from './components/ProfileManagement';
import UserSelection from './components/UserSelection';
// import ResumeManagement from './components/ResumeManagement';
import AuditRecords from './components/AuditRecords';
// import TemplateManagement from './components/TemplateManagement';
import Login from './components/Login';
import Signup from './components/Signup';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

// Dashboard Component
const Dashboard = () => {
  const [tabIndex, setTabIndex] = useState(0);
  const { logout } = useAuth();

  const handleTabIndexChange = (event, newIndex) => {
    setTabIndex(newIndex);
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <DashboardIcon sx={{ mr: 2, fontSize: 32 }} color="primary" />
            <Typography variant="h4" component="h1">
              Email Campaign Dashboard
            </Typography>
          </Box>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            sx={{ ml: 2 }}
          >
            Logout
          </Button>
        </Box>

        <Tabs 
          value={tabIndex} 
          onChange={handleTabIndexChange} 
          indicatorColor="primary" 
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTabs-scrollButtons.Mui-disabled': {
              opacity: 0.3,
            },
            '& .MuiTab-root': {
              minWidth: { xs: '120px', sm: '160px' },
              fontSize: { xs: '14px', sm: '16px' },
              py: { xs: 1, sm: 1.5 }
            }
          }}
        >
          <Tab label="User Selection" />
          {/* <Tab label="Resume Management" /> */}
          {/* <Tab label="Template Management" /> */}
          <Tab label="All Records" />
          <Tab label="Profile Management" />
        </Tabs>

        {tabIndex === 0 && <UserSelection />}
        {/* {tabIndex === 1 && <ResumeManagement />} */}
        {/* {tabIndex === 2 && <TemplateManagement />} */}
        {tabIndex === 1 && <AuditRecords />}
        {tabIndex === 2 && <ProfileManagement />}
      </Paper>
    </Container>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;