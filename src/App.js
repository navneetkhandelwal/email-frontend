import React, { useState, useEffect } from 'react';
import {
  Box, Button, Container, Paper, TextField, Typography, Grid, 
  Tabs, Tab, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, IconButton, CircularProgress, Snackbar, Alert,
  FormControl, InputLabel, Select, MenuItem, Pagination, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import EmailIcon from '@mui/icons-material/Email';
import DashboardIcon from '@mui/icons-material/Dashboard';
import axios from 'axios';

function App() {
  //tab
  const [tabIndex, setTabIndex] = useState(0);

  // Email credentials
  const [emailCredentials, setEmailCredentials] = useState({
    email: '',
    password: ''
  });

  const [emailAudit, setEmailAudit] = useState(null);
  
  // User selection
  const [userProfile, setUserProfile] = useState(null);
  const [isProfileLoading, setIsProfileLoading] = useState(false);

  const [selectedUser, setSelectedUser] = useState('navneet');
  const [customEmailBody, setCustomEmailBody] = useState('');
  const [currentResumeLink, setCurrentResumeLink] = useState('');
  const [newResumeLink, setNewResumeLink] = useState('');
  const [isResumeLinkLoading, setIsResumeLinkLoading] = useState(false);
  const [isResumeTabUnlocked, setIsResumeTabUnlocked] = useState(false);
  const [resumeBrocode, setResumeBrocode] = useState('');
  const [resumeBrocodeError, setResumeBrocodeError] = useState(false);
  
  // Tab state
  const [tabValue, setTabValue] = useState(0);
  
  // CSV file upload
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  
  // Manual entry data
  const [manualEntries, setManualEntries] = useState([
    { Name: '', Company: '', Email: '', Role: '', Link: '' }
  ]);
  
  // Loading and status states
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', message: '' });
  const [openSnackbar, setOpenSnackbar] = useState(false);
  
  // Email progress tracking
  const [emailProgress, setEmailProgress] = useState({
    total: 0,
    current: 0,
    success: 0,
    failed: 0,
    logs: []
  });

  // Add this state near other state declarations
  const [brocode, setBrocode] = useState('');
  const [isAuditUnlocked, setIsAuditUnlocked] = useState(false);
  const [brocodeError, setBrocodeError] = useState(false);

  // Add these state declarations near other states
  const [page, setPage] = useState(1);
  const [selectedNameFilter, setSelectedNameFilter] = useState('all');
  const rowsPerPage = 10;

  // Add these new state variables with other states
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [isDeleteEnabled, setIsDeleteEnabled] = useState(false);
  const [deletePasswordError, setDeletePasswordError] = useState(false);
  const [showProfileWarning, setShowProfileWarning] = useState(false);
  const [pendingEmailData, setPendingEmailData] = useState(null);

  // Add this constant for the name options
  const nameOptions = [
    { value: 'all', label: 'All Names' },
    { value: 'navneet', label: 'Navneet' },
    { value: 'teghdeep', label: 'Teghdeep' },
    { value: 'divyam', label: 'Divyam' },
    { value: 'dhananjay', label: 'Dhananjay' },
    { value: 'akash', label: 'Akash' },
    { value: 'avi', label: 'Avi' },
    { value: 'komal', label: 'Komal' },
    { value: 'pooja', label: 'Pooja' }
  ];

  // Add these helper functions at the top of the file, after the imports
  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  // Function to fetch user profile
  const fetchUserProfile = async () => {
    setIsProfileLoading(true);
    try {
      // Get the appropriate API URL (same as your existing pattern)
      const apiUrl = process.env.NODE_ENV === 'production' 
        ? 'https://email-backend-tf0l.onrender.com' 
        : 'http://localhost:5001';
      
      const response = await axios.get(`${apiUrl}/api/user-profile`);
      console.error('Response of user profile:', response);
      
      if (response && response.data) {
        setUserProfile(response.data);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setStatusMessage({ 
        type: 'error', 
        message: 'Failed to fetch user profile information'
      });
      setOpenSnackbar(true);
    } finally {
      setIsProfileLoading(false);
    }
  };

  const fetchEmailAudit = async () => {
    setIsProfileLoading(true);
    try {
      // Get the appropriate API URL (same as your existing pattern)
      const apiUrl = process.env.NODE_ENV === 'production' 
        ? 'https://email-backend-tf0l.onrender.com' 
        : 'http://localhost:5001';
      
      const response = await axios.get(`${apiUrl}/api/email-audit`);
      console.error('Response of email audit:', response);
      
      if (response && response.data) {
        setEmailAudit(response.data);
      }
    } catch (error) {
      console.error('Error fetching email audit:', error);
      setStatusMessage({ 
        type: 'error', 
        message: 'Failed to fetch email audit information'
      });
      setOpenSnackbar(true);
    } finally {
      setIsProfileLoading(false);
    }
  };

  const fetchBasicInformation = async () => {
    fetchUserProfile();
    fetchEmailAudit();
  };

 // Fetch profile on component mount
 useEffect(() => {
  fetchBasicInformation();
}, []); // Empty dependency array means this runs once on mount

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleTabIndexChange = (event, newIndex) => {
    setTabIndex(newIndex);
  };

  // Handle email credentials change
  const handleCredentialsChange = (e) => {
    setEmailCredentials({
      ...emailCredentials,
      [e.target.name]: e.target.value
    });
  };

  // Handle user selection change
  const handleUserChange = (e) => {
    const newUserType = e.target.value;
    setSelectedUser(newUserType);
  };

  // Handle custom email body change
  const handleCustomEmailBodyChange = (e) => {
    setCustomEmailBody(e.target.value);
  };

  // Handle CSV file upload
  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
      setFileName(e.target.files[0].name);
    }
  };

  // Handle manual entry fields change
  const handleManualEntryChange = (index, field, value) => {
    const updatedEntries = [...manualEntries];
    updatedEntries[index][field] = value;
    setManualEntries(updatedEntries);
  };

  // Add a new empty row for manual entry
  const addManualEntry = () => {
    setManualEntries([
      ...manualEntries,
      { Name: '', Company: '', Email: '', Role: '', Link: '' }
    ]);
  };

  // Remove a row from manual entry
  const removeManualEntry = (index) => {
    const updatedEntries = manualEntries.filter((_, i) => i !== index);
    setManualEntries(updatedEntries.length ? updatedEntries : [{ Name: '', Company: '', Email: '', Role: '', Link: '' }]);
  };

  // Add this new function with other handlers
  const handleProfileWarningConfirm = () => {
    setShowProfileWarning(false);
    if (pendingEmailData) {
      proceedWithEmailSend(pendingEmailData);
    }
    setPendingEmailData(null);
  };

  // Add this new function to handle the actual email sending
  const proceedWithEmailSend = async (formData) => {
    setIsLoading(true);
    try {
      const apiUrl = process.env.NODE_ENV === 'production' 
        ? 'https://email-backend-tf0l.onrender.com' 
        : 'http://localhost:5001';

      const eventSource = new EventSource(`${apiUrl}/api/send-emails-sse?email=${emailCredentials.email}`);
      
      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        if (data.type === 'progress') {
          setEmailProgress(prev => ({
            ...prev,
            total: data.total,
            current: data.current,
            success: data.success,
            failed: data.failed
          }));
        } else if (data.type === 'log') {
          setEmailProgress(prev => ({
            ...prev,
            logs: [...prev.logs, data.message]
          }));
        } else if (data.type === 'complete') {
          eventSource.close();
          setIsLoading(false);
          setStatusMessage({ type: 'success', message: `Completed sending emails. Success: ${data.success}, Failed: ${data.failed}` });
          setOpenSnackbar(true);
        }
      };
      
      eventSource.onerror = () => {
        eventSource.close();
        setIsLoading(false);
        setStatusMessage({ type: 'error', message: 'Error during email sending process' });
        setOpenSnackbar(true);
      };

      // Start the process with a POST request
      await axios.post(`${apiUrl}/api/send-emails`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    } catch (error) {
      setIsLoading(false);
      console.error('Error sending emails:', error);
      setStatusMessage({ 
        type: 'error', 
        message: error.response?.data?.message || 'Error sending emails. Please try again.' 
      });
      setOpenSnackbar(true);
    }
  };

  // Modify the handleSendEmails function
  const handleSendEmails = async () => {
    // Validate email credentials
    if (!emailCredentials.email || !emailCredentials.password) {
      setStatusMessage({ type: 'error', message: 'Email credentials are required' });
      setOpenSnackbar(true);
      return;
    }

    // Validate custom email body if "other" user is selected
    if (selectedUser === 'other' && !customEmailBody.trim()) {
      setStatusMessage({ type: 'error', message: 'Please enter a custom email body' });
      setOpenSnackbar(true);
      return;
    }

    // Validate data based on active tab
    if (tabValue === 0 && !file) {
      setStatusMessage({ type: 'error', message: 'Please upload a CSV file' });
      setOpenSnackbar(true);
      return;
    }

    if (tabValue === 1) {
      const validEntries = manualEntries.filter(entry => 
        entry.Name && entry.Company && entry.Email && entry.Role
      );
      if (validEntries.length === 0) {
        setStatusMessage({ type: 'error', message: 'Please enter at least one valid entry' });
        setOpenSnackbar(true);
        return;
      }
    }

    setEmailProgress({
      total: 0,
      current: 0,
      success: 0,
      failed: 0,
      logs: []
    });

    const formData = new FormData();
    formData.append('email', emailCredentials.email);
    formData.append('password', emailCredentials.password);
    formData.append('userType', selectedUser);
    
    if (selectedUser === 'other') {
      formData.append('customEmailBody', customEmailBody);
    }
    
    if (tabValue === 0) {
      formData.append('file', file);
      formData.append('mode', 'csv');
    } else {
      formData.append('data', JSON.stringify(manualEntries.filter(entry => 
        entry.Name && entry.Company && entry.Email && entry.Role
      )));
      formData.append('mode', 'manual');
    }

    // Check if email contains the selected profile name
    const nameMap = {
      navneet: "Navneet",
      teghdeep: "Teghdeep",
      divyam: "Divyam",
      dhananjay: "Dhananjay",
      akash: "Akash",
      avi: "Avi",
      komal: "Komal",
      pooja: "Pooja"
    };

    const profileName = nameMap[selectedUser.toLowerCase()];
    if (profileName && !emailCredentials.email.toLowerCase().includes(profileName.toLowerCase())) {
      setPendingEmailData(formData);
      setShowProfileWarning(true);
      return;
    }

    // If no warning needed, proceed with sending
    await proceedWithEmailSend(formData);
  };

  // Add this function with other handlers
  const handleBrocodeSubmit = () => {
    if (brocode === 'tandav') {
      setIsAuditUnlocked(true);
      setBrocodeError(false);
    } else {
      setBrocodeError(true);
      setIsAuditUnlocked(false);
    }
  };

  // Add these handler functions
  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleNameFilterChange = (event) => {
    setSelectedNameFilter(event.target.value);
    setPage(1); // Reset to first page when filter changes
  };

  // Add this function to filter and paginate records
  const getFilteredAndPaginatedRecords = (records) => {
    if (!records) return [];
    
    // First apply the name filter
    const filteredRecords = selectedNameFilter === 'all'
      ? records
      : records.filter(record => record.userProfile.toLowerCase() === selectedNameFilter);
    
    // Then paginate
    const startIndex = (page - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    
    return {
      paginatedRecords: filteredRecords.slice(startIndex, endIndex),
      totalRecords: filteredRecords.length
    };
  };

  // Add this handler function with other handlers
  const handleResend = (record) => {
    // Set manual entry data with the record details
    setManualEntries([{
      Name: record.name,
      Company: record.company,
      Email: record.email,
      Role: record.role,
      Link: record.link || ''
    }]);
    
    // Switch to the user selection tab
    setTabIndex(0);
    
    // Switch to manual entry tab
    setTabValue(1);
    
    // Set the user type
    setSelectedUser(record.userProfile.toLowerCase());
  };

  // Add this handler function with other handlers
  const handleDeleteRecord = async (recordId) => {
    if (!recordId) {
      setStatusMessage({ 
        type: 'error', 
        message: 'Invalid record ID' 
      });
      setOpenSnackbar(true);
      return;
    }

    try {
      const apiUrl = process.env.NODE_ENV === 'production' 
        ? 'https://email-backend-tf0l.onrender.com' 
        : 'http://localhost:5001';

      // Log the record ID and API URL
      console.log('Attempting to delete record:', {
        recordId,
        apiUrl,
        deleteUrl: `${apiUrl}/api/email-audit/${recordId}`
      });

      const response = await axios.delete(`${apiUrl}/api/email-audit/${recordId}`);
      console.log('Delete response:', response);
      
      if (response.data.success) {
        // Show success message
        setStatusMessage({ 
          type: 'success', 
          message: response.data.message || 'Record deleted successfully' 
        });
        setOpenSnackbar(true);
        
        // Refresh the audit records
        await fetchEmailAudit();
      } else {
        throw new Error(response.data.message || 'Failed to delete record');
      }
    } catch (error) {
      console.error('Error deleting record:', {
        error,
        response: error.response,
        recordId
      });
      setStatusMessage({ 
        type: 'error', 
        message: error.response?.data?.message || error.message || 'Error deleting record' 
      });
      setOpenSnackbar(true);
    }
  };

  // Add this new function with other handlers
  const handleDeletePassword = () => {
    // Get current date in IST
    const now = new Date();
    const istTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000)); // Add 5.5 hours for IST
    const day = String(istTime.getDate()).padStart(2, '0');
    const month = String(istTime.getMonth() + 1).padStart(2, '0');
    const year = istTime.getFullYear();
    const expectedPassword = `${day}${month}${year}`;

    if (deletePassword === expectedPassword) {
      setIsDeleteEnabled(true);
      setShowDeleteDialog(false);
      setDeletePassword('');
      setDeletePasswordError(false);
      setStatusMessage({ 
        type: 'success', 
        message: 'Delete functionality enabled' 
      });
      setOpenSnackbar(true);
    } else {
      setDeletePasswordError(true);
    }
  };

  // Add function to fetch resume link
  const fetchResumeLink = async (userType) => {
    setIsResumeLinkLoading(true);
    try {
      const apiUrl = process.env.NODE_ENV === 'production' 
        ? 'https://email-backend-tf0l.onrender.com' 
        : 'http://localhost:5001';

      const response = await axios.get(`${apiUrl}/api/get-resume-link/${userType}`);
      console.log('Resume link response:', response.data);
      
      if (response.data.success) {
        const link = response.data.resumeLink;
        console.log('Setting current resume link:', link);
        setCurrentResumeLink(link);
      } else {
        console.log('No resume link found in response');
        setCurrentResumeLink('');
      }
    } catch (error) {
      console.error('Error fetching resume link:', error);
      setStatusMessage({ 
        type: 'error', 
        message: error.response?.data?.message || error.message || 'Error fetching resume link' 
      });
      setOpenSnackbar(true);
      setCurrentResumeLink('');
    } finally {
      setIsResumeLinkLoading(false);
    }
  };

  // Modify handleResumeLinkUpdate to clear the input after successful update
  const handleResumeLinkUpdate = async () => {
    if (!selectedUser || !newResumeLink) {
      setStatusMessage({ type: 'error', message: 'Please select a user and enter a resume link' });
      setOpenSnackbar(true);
      return;
    }

    try {
      const apiUrl = process.env.NODE_ENV === 'production' 
        ? 'https://email-backend-tf0l.onrender.com' 
        : 'http://localhost:5001';

      const response = await axios.post(`${apiUrl}/api/update-resume-link`, {
        userType: selectedUser,
        resumeLink: newResumeLink
      });

      if (response.data.success) {
        setCurrentResumeLink(newResumeLink);
        setNewResumeLink(''); // Clear the input field after successful update
        setStatusMessage({ 
          type: 'success', 
          message: 'Resume link updated successfully' 
        });
      } else {
        throw new Error(response.data.message || 'Failed to update resume link');
      }
    } catch (error) {
      setStatusMessage({ 
        type: 'error', 
        message: error.response?.data?.message || error.message || 'Error updating resume link' 
      });
    }
    setOpenSnackbar(true);
  };

  // Add useEffect to fetch initial resume link
  useEffect(() => {
    if (selectedUser !== 'other') {
      fetchResumeLink(selectedUser);
    } else {
      setCurrentResumeLink(''); // Clear resume link for 'other' user
    }
  }, [selectedUser]); // Run when selectedUser changes

  // Add handler for resume tab brocode
  const handleResumeBrocodeSubmit = () => {
    if (resumeBrocode === 'nottandav') {
      setIsResumeTabUnlocked(true);
      setResumeBrocodeError(false);
      // Automatically select Navneet's profile
      setSelectedUser('navneet');
      fetchResumeLink('navneet');
    } else {
      setResumeBrocodeError(true);
      setIsResumeTabUnlocked(false);
    }
  };

  // Add this helper function after the imports
  const convertGoogleDriveUrl = (url) => {
    if (!url) return null;
    
    // Remove the @ prefix if it exists
    url = url.startsWith('@') ? url.substring(1) : url;
    
    // Check if it's a Google Drive URL
    if (url.includes('drive.google.com')) {
      // Handle different Google Drive URL formats
      let fileId = '';
      
      if (url.includes('/file/d/')) {
        // Format: https://drive.google.com/file/d/[fileId]/view
        fileId = url.split('/file/d/')[1].split('/')[0];
      } else if (url.includes('id=')) {
        // Format: https://drive.google.com/open?id=[fileId]
        fileId = url.split('id=')[1].split('&')[0];
      }
      
      if (fileId) {
        return `https://drive.google.com/file/d/${fileId}/preview`;
      }
    }
    
    // Return the original URL if it's not a Google Drive URL
    return url;
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
          <DashboardIcon sx={{ mr: 2, fontSize: 32 }} color="primary" />
          <Typography variant="h4" component="h1">
            Email Campaign Dashboard
          </Typography>
        </Box>

        {/* Tabs Navigation */}
        <Tabs value={tabIndex} onChange={handleTabIndexChange} indicatorColor="primary" textColor="primary">
          <Tab label="User Selection" />
          <Tab label="Resume Management" />
          <Tab label="All Records" />
        </Tabs>

        {/* Tab Panels */}
        {tabIndex === 0 && (
          <Box sx={{ mt: 3 }}>
            {/* User Selection Section */}
            <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
              User Selection
            </Typography>
            <Grid container spacing={2} sx={{ mb: 4 }}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel id="user-select-label">Select User</InputLabel>
                  <Select
                    labelId="user-select-label"
                    id="user-select"
                    value={selectedUser}
                    label="Select User"
                    onChange={handleUserChange}
                    disabled={isProfileLoading}
                  >
                    {userProfile && userProfile.userProfiles && userProfile.userProfiles.length > 0 ? (
                      userProfile.userProfiles.map((user) => (
                        <MenuItem key={user.name} value={user.name.toLowerCase()}>
                          {capitalizeFirstLetter(user.name)}
                        </MenuItem>
                      ))
                    ) : (
                      <>
                        <MenuItem value="navneet">Navneet</MenuItem>
                        <MenuItem value="teghdeep">Teghdeep</MenuItem>
                        <MenuItem value="divyam">Divyam</MenuItem>
                        <MenuItem value="dhananjay">Dhananjay</MenuItem>
                        <MenuItem value="akash">Akash</MenuItem>
                        <MenuItem value="avi">Avi</MenuItem>
                        <MenuItem value="komal">Komal</MenuItem>
                        <MenuItem value="pooja">Pooja</MenuItem>
                        <MenuItem value="other">Other</MenuItem>
                      </>
                    )}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            {/* Custom Email Body Section (only shown when "Other" is selected) */}
            {selectedUser === 'other' && (
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
                  Custom Email Body
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={10}
                  label="Custom Email Body"
                  value={customEmailBody}
                  onChange={handleCustomEmailBodyChange}
                  variant="outlined"
                  placeholder="Enter your custom email body HTML here. Start with <body> and end with </body>"
                  helperText="Start with <body> tag and end with </body> tag. Include all HTML content for the email."
                />
              </Box>
            )}

            {/* Email Credentials Section */}
            <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
              Email Credentials
            </Typography>
            <Grid container spacing={2} sx={{ mb: 4 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Your Email"
                  name="email"
                  value={emailCredentials.email}
                  onChange={handleCredentialsChange}
                  variant="outlined"
                  placeholder="your.email@gmail.com"
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="App Password"
                  name="password"
                  value={emailCredentials.password}
                  onChange={handleCredentialsChange}
                  variant="outlined"
                  type="password"
                  placeholder="Your Google App Password"
                  required
                  helperText="Use Google App Password, not your regular password"
                />
              </Grid>
            </Grid>

            {/* Data Input Tabs */}
            <Box sx={{ mb: 3 }}>
              <Tabs value={tabValue} onChange={handleTabChange}>
                <Tab label="Upload CSV" icon={<UploadFileIcon />} iconPosition="start" />
                <Tab label="Manual Entry" icon={<AddIcon />} iconPosition="start" />
              </Tabs>
            </Box>

            {/* CSV Upload Tab */}
            <Box sx={{ display: tabValue === 0 ? 'block' : 'none' }}>
              <Box sx={{ mb: 3, p: 3, border: '2px dashed #ccc', borderRadius: 2, textAlign: 'center' }}>
                <input
                  accept=".csv,.xlsx,.xls"
                  style={{ display: 'none' }}
                  id="csv-file-upload"
                  type="file"
                  onChange={handleFileChange}
                />
                <label htmlFor="csv-file-upload">
                  <Button
                    variant="contained"
                    component="span"
                    startIcon={<UploadFileIcon />}
                  >
                    Upload CSV File
                  </Button>
                </label>
                <Box sx={{ mt: 2 }}>
                  {fileName ? (
                    <Typography variant="body1">
                      Selected file: {fileName}
                    </Typography>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Supported formats: CSV, XLSX, XLS
                    </Typography>
                  )}
                </Box>
              </Box>
            </Box>

            {/* Manual Entry Tab */}
            <Box sx={{ display: tabValue === 1 ? 'block' : 'none' }}>
              {/* Mobile View */}
              <Box sx={{ 
                display: { xs: 'block', md: 'none' },
                '& .MuiTextField-root': {
                  mb: 2,
                  '& input': {
                    fontSize: '16px',
                    padding: '12px'
                  }
                }
              }}>
                {manualEntries.map((entry, index) => (
                  <Paper 
                    key={index} 
                    sx={{ 
                      p: 2, 
                      mb: 2,
                      position: 'relative'
                    }}
                  >
                    <IconButton 
                      color="error" 
                      onClick={() => removeManualEntry(index)}
                      disabled={manualEntries.length === 1}
                      sx={{
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        padding: '8px'
                      }}
                    >
                      <DeleteIcon sx={{ fontSize: '24px' }} />
                    </IconButton>

                    <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
                      Entry #{index + 1}
                    </Typography>

                    <TextField
                      fullWidth
                      value={entry.Name}
                      onChange={(e) => handleManualEntryChange(index, 'Name', e.target.value)}
                      placeholder="Full Name"
                      label="Name"
                    />
                    <TextField
                      fullWidth
                      value={entry.Company}
                      onChange={(e) => handleManualEntryChange(index, 'Company', e.target.value)}
                      placeholder="Company Name"
                      label="Company"
                    />
                    <TextField
                      fullWidth
                      value={entry.Email}
                      onChange={(e) => handleManualEntryChange(index, 'Email', e.target.value)}
                      placeholder="Email Address"
                      label="Email"
                    />
                    <TextField
                      fullWidth
                      value={entry.Role}
                      onChange={(e) => handleManualEntryChange(index, 'Role', e.target.value)}
                      placeholder="Job Role"
                      label="Role"
                    />
                    <TextField
                      fullWidth
                      value={entry.Link}
                      onChange={(e) => handleManualEntryChange(index, 'Link', e.target.value)}
                      placeholder="Job Link (Optional)"
                      label="Link"
                    />
                  </Paper>
                ))}
              </Box>

              {/* Desktop View */}
              <Box sx={{ 
                display: { xs: 'none', md: 'block' },
                overflowX: 'auto'
              }}>
                <Table sx={{ minWidth: 650 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Company</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Role</TableCell>
                      <TableCell>Link</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {manualEntries.map((entry, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <TextField
                            fullWidth
                            size="small"
                            value={entry.Name}
                            onChange={(e) => handleManualEntryChange(index, 'Name', e.target.value)}
                            placeholder="Full Name"
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            fullWidth
                            size="small"
                            value={entry.Company}
                            onChange={(e) => handleManualEntryChange(index, 'Company', e.target.value)}
                            placeholder="Company Name"
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            fullWidth
                            size="small"
                            value={entry.Email}
                            onChange={(e) => handleManualEntryChange(index, 'Email', e.target.value)}
                            placeholder="Email Address"
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            fullWidth
                            size="small"
                            value={entry.Role}
                            onChange={(e) => handleManualEntryChange(index, 'Role', e.target.value)}
                            placeholder="Job Role"
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            fullWidth
                            size="small"
                            value={entry.Link}
                            onChange={(e) => handleManualEntryChange(index, 'Link', e.target.value)}
                            placeholder="Job Link"
                          />
                        </TableCell>
                        <TableCell>
                          <IconButton 
                            color="error" 
                            onClick={() => removeManualEntry(index)}
                            disabled={manualEntries.length === 1}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>

              <Button 
                variant="outlined" 
                startIcon={<AddIcon />} 
                onClick={addManualEntry}
                sx={{
                  mt: 2,
                  py: { xs: 1.5, sm: 1 },
                  px: { xs: 3, sm: 2 },
                  fontSize: { xs: '16px', sm: '14px' }
                }}
              >
                Add Entry
              </Button>
            </Box>

            {/* Send Button */}
            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <EmailIcon />}
                onClick={handleSendEmails}
                disabled={isLoading}
                sx={{ py: 1.5, px: 4 }}
              >
                {isLoading ? 'Sending...' : 'Send Emails'}
              </Button>
            </Box>

            {/* Progress Section */}
            {isLoading && (
              <Box sx={{ mt: 4, p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Email Sending Progress
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="body1">
                    Progress: {emailProgress.current}/{emailProgress.total} 
                    ({emailProgress.total > 0 ? Math.round((emailProgress.current / emailProgress.total) * 100) : 0}%)
                  </Typography>
                  <Typography variant="body1">
                    Success: {emailProgress.success} | Failed: {emailProgress.failed}
                  </Typography>
                </Box>
                <Box sx={{ width: '100%', mb: 2 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={emailProgress.total > 0 ? (emailProgress.current / emailProgress.total) * 100 : 0} 
                  />
                </Box>
                <Paper 
                  variant="outlined" 
                  sx={{ 
                    p: 1, 
                    maxHeight: '200px', 
                    overflow: 'auto', 
                    bgcolor: '#000', 
                    color: '#0f0',
                    fontFamily: 'monospace' 
                  }}
                >
                  {emailProgress.logs.map((log, index) => (
                    <Typography key={index} variant="body2" component="div" sx={{ fontSize: '0.85rem' }}>
                      {log}
                    </Typography>
                  ))}
                </Paper>
              </Box>
            )}
          </Box>
        )}

        {/* Resume Management Tab */}
        {tabIndex === 1 && (
          <Box sx={{ mt: 3 }}>
            {!isResumeTabUnlocked ? (
              <Box sx={{ 
                maxWidth: 400, 
                mx: 'auto', 
                mt: 4,
                p: 3,
                borderRadius: 2,
                bgcolor: 'background.paper',
                boxShadow: 3
              }}>
                <Typography variant="h6" sx={{ mb: 2, textAlign: 'center' }}>
                  🔒 Enter Brocode to Access Resume Management
                </Typography>
                <TextField
                  fullWidth
                  type="password"
                  label="Brocode"
                  value={resumeBrocode}
                  onChange={(e) => setResumeBrocode(e.target.value)}
                  error={resumeBrocodeError}
                  helperText={resumeBrocodeError ? "Incorrect brocode" : ""}
                  sx={{ mb: 2 }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleResumeBrocodeSubmit();
                    }
                  }}
                />
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleResumeBrocodeSubmit}
                  sx={{ 
                    py: 1.5,
                    bgcolor: 'primary.main',
                    '&:hover': {
                      bgcolor: 'primary.dark',
                    }
                  }}
                >
                  Unlock Resume Management
                </Button>
              </Box>
            ) : (
              <Box>
                <Typography variant="h6" component="h2" sx={{ mb: 3 }}>
                  Resume Management
                </Typography>
                
                <Box sx={{ mb: 4 }}>
                  <FormControl fullWidth sx={{ mb: 3 }}>
                    <InputLabel id="resume-profile-select-label">Select Profile</InputLabel>
                    <Select
                      labelId="resume-profile-select-label"
                      id="resume-profile-select"
                      value={selectedUser}
                      label="Select Profile"
                      onChange={handleUserChange}
                    >
                      {userProfile && userProfile.userProfiles && userProfile.userProfiles.length > 0 ? (
                        userProfile.userProfiles.map((user) => (
                          <MenuItem key={user.name} value={user.name.toLowerCase()}>
                            {capitalizeFirstLetter(user.name)}
                          </MenuItem>
                        ))
                      ) : (
                        <>
                          <MenuItem value="navneet">Navneet</MenuItem>
                          <MenuItem value="teghdeep">Teghdeep</MenuItem>
                          <MenuItem value="divyam">Divyam</MenuItem>
                          <MenuItem value="dhananjay">Dhananjay</MenuItem>
                          <MenuItem value="akash">Akash</MenuItem>
                          <MenuItem value="avi">Avi</MenuItem>
                          <MenuItem value="komal">Komal</MenuItem>
                          <MenuItem value="pooja">Pooja</MenuItem>
                        </>
                      )}
                    </Select>
                  </FormControl>

                  {/* Current Resume Link Display */}
                  <Box sx={{ 
                    p: 2, 
                    bgcolor: '#f5f5f5', 
                    borderRadius: 1,
                    border: '1px solid #e0e0e0',
                    mb: 3
                  }}>
                    <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                      Current Resume Link
                    </Typography>
                    {isResumeLinkLoading ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CircularProgress size={20} />
                        <Typography variant="body2">Loading...</Typography>
                      </Box>
                    ) : currentResumeLink ? (
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          wordBreak: 'break-all',
                          fontFamily: 'monospace',
                          bgcolor: '#ffffff',
                          p: 1,
                          borderRadius: 0.5
                        }}
                      >
                        {currentResumeLink.startsWith('@') ? currentResumeLink.substring(1) : currentResumeLink}
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                        No resume link set
                      </Typography>
                    )}
                  </Box>

                  {/* Update Resume Link Field */}
                  <Box sx={{ display: 'flex', gap: 1, mb: 4 }}>
                    <TextField
                      fullWidth
                      label="New Resume Link"
                      value={newResumeLink}
                      onChange={(e) => setNewResumeLink(e.target.value)}
                      variant="outlined"
                      placeholder="@https://drive.google.com/..."
                      helperText="Enter new resume link to update"
                    />
                    <Button
                      variant="contained"
                      onClick={handleResumeLinkUpdate}
                      sx={{ height: 56 }}
                      disabled={isResumeLinkLoading}
                    >
                      Update
                    </Button>
                  </Box>

                  {/* PDF Preview Section */}
                  {currentResumeLink && (
                    <Box sx={{ mt: 4 }}>
                      <Typography variant="h6" component="h3" sx={{ mb: 2 }}>
                        Resume Preview
                      </Typography>
                      <Paper 
                        elevation={3} 
                        sx={{ 
                          width: '100%',
                          height: '800px',
                          overflow: 'hidden',
                          borderRadius: 2,
                          bgcolor: '#f5f5f5'
                        }}
                      >
                        <iframe
                          src={convertGoogleDriveUrl(currentResumeLink)}
                          width="100%"
                          height="100%"
                          frameBorder="0"
                          title="Resume Preview"
                          loading="lazy"
                          style={{ backgroundColor: '#fff' }}
                        />
                      </Paper>
                    </Box>
                  )}
                </Box>
              </Box>
            )}
          </Box>
        )}

        {/* Tab Panels */}
        {tabIndex === 2 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" component="h2">
              Audit Logs
            </Typography>

            {!isAuditUnlocked ? (
              <Box sx={{ 
                maxWidth: 400, 
                mx: 'auto', 
                mt: 4,
                p: 3,
                borderRadius: 2,
                bgcolor: 'background.paper',
                boxShadow: 3
              }}>
                <Typography variant="h6" sx={{ mb: 2, textAlign: 'center' }}>
                  🔒 Enter Brocode to Access Audit Logs
                </Typography>
                <TextField
                  fullWidth
                  type="password"
                  label="Brocode"
                  value={brocode}
                  onChange={(e) => setBrocode(e.target.value)}
                  error={brocodeError}
                  helperText={brocodeError ? "Incorrect brocode" : ""}
                  sx={{ mb: 2 }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleBrocodeSubmit();
                    }
                  }}
                />
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleBrocodeSubmit}
                  sx={{ 
                    py: 1.5,
                    bgcolor: 'primary.main',
                    '&:hover': {
                      bgcolor: 'primary.dark',
                    }
                  }}
                >
                  Unlock Audit Logs
                </Button>
              </Box>
            ) : (
              <Box sx={{ mt: 2 }}>
                <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle1" sx={{ color: 'success.main' }}>
                    🔓 Audit Logs Unlocked
                  </Typography>
                  <Button 
                    variant="outlined" 
                    color="primary"
                    size="small"
                    onClick={() => {
                      setIsAuditUnlocked(false);
                      setBrocode('');
                      setBrocodeError(false);
                    }}
                  >
                    Lock Audit Logs
                  </Button>
                </Box>

                {/* Filter Section */}
                <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                  <FormControl sx={{ minWidth: 200 }}>
                    <InputLabel id="name-filter-label">Filter by Name</InputLabel>
                    <Select
                      labelId="name-filter-label"
                      value={selectedNameFilter}
                      label="Filter by Name"
                      onChange={handleNameFilterChange}
                    >
                      {nameOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>UserProfile</TableCell>
                        <TableCell>Name</TableCell>
                        <TableCell>Company</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Role</TableCell>
                        <TableCell>Link</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Created At</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {emailAudit?.records ? (
                        getFilteredAndPaginatedRecords(emailAudit.records).paginatedRecords.map((record) => (
                          <TableRow key={record._id || record.name}>
                            <TableCell>{capitalizeFirstLetter(record.userProfile)}</TableCell>
                            <TableCell>{record.name}</TableCell>
                            <TableCell>{record.company}</TableCell>
                            <TableCell>{record.email}</TableCell>
                            <TableCell>{record.role}</TableCell>
                            <TableCell>{record.link}</TableCell>
                            <TableCell>
                              <Box sx={{ 
                                display: 'inline-flex', 
                                alignItems: 'center',
                                color: record.status === 'success' ? 'success.main' : 'error.main',
                                fontWeight: 500
                              }}>
                                {record.status === 'success' ? '✓' : '✗'} {record.status}
                              </Box>
                            </TableCell>
                            <TableCell>
                              {new Date(record.createdAt).toLocaleString()}
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', gap: 1 }}>
                                <Button
                                  variant="outlined"
                                  size="small"
                                  color="primary"
                                  onClick={() => handleResend(record)}
                                  startIcon={<EmailIcon />}
                                  sx={{
                                    minWidth: 'auto',
                                    whiteSpace: 'nowrap'
                                  }}
                                >
                                  Resend
                                </Button>
                                {isDeleteEnabled && (
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => handleDeleteRecord(record._id)}
                                  >
                                    <DeleteIcon />
                                  </IconButton>
                                )}
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={9} align="center">
                            No records found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>

                {/* Pagination */}
                {emailAudit?.records && (
                  <Box sx={{ 
                    mt: 2, 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    px: 2
                  }}>
                    <Typography variant="body2" color="text.secondary">
                      Showing {Math.min(rowsPerPage, getFilteredAndPaginatedRecords(emailAudit.records).totalRecords)} of {getFilteredAndPaginatedRecords(emailAudit.records).totalRecords} entries
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                      <Pagination
                        count={Math.ceil(getFilteredAndPaginatedRecords(emailAudit.records).totalRecords / rowsPerPage)}
                        page={page}
                        onChange={handlePageChange}
                        color="primary"
                        showFirstButton
                        showLastButton
                      />
                    </Box>
                  </Box>
                )}
              </Box>
            )}
          </Box>
        )}

        
      </Paper>

      {/* Notifications */}
      <Snackbar 
        open={openSnackbar} 
        autoHideDuration={6000} 
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setOpenSnackbar(false)} 
          severity={statusMessage.type} 
          variant="filled"
        >
          {statusMessage.message}
        </Alert>
      </Snackbar>

      {/* Hidden button in top-right corner - Only show on audit page after brocode */}
      {tabIndex === 2 && isAuditUnlocked && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            right: 0,
            width: '20px',
            height: '20px',
            cursor: 'pointer',
            zIndex: 9999
          }}
          onClick={() => setShowDeleteDialog(true)}
        />
      )}

      {/* Password Dialog */}
      <Dialog 
        open={showDeleteDialog} 
        onClose={() => {
          setShowDeleteDialog(false);
          setDeletePassword('');
          setDeletePasswordError(false);
        }}
      >
        <DialogTitle>Enter Password</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Password"
            type="password"
            fullWidth
            variant="outlined"
            value={deletePassword}
            onChange={(e) => setDeletePassword(e.target.value)}
            error={deletePasswordError}
            helperText={deletePasswordError ? "Incorrect password" : ""}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleDeletePassword();
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setShowDeleteDialog(false);
            setDeletePassword('');
            setDeletePasswordError(false);
          }}>
            Cancel
          </Button>
          <Button onClick={handleDeletePassword}>
            Submit
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Profile Warning Dialog */}
      <Dialog
        open={showProfileWarning}
        onClose={() => {
          setShowProfileWarning(false);
          setPendingEmailData(null);
        }}
      >
        <DialogTitle>Profile Name Mismatch</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            The email address you entered doesn't contain the selected profile name:
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            • Email: {emailCredentials.email}
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            • Selected Profile: {selectedUser}
          </Typography>
          <Typography variant="body1">
            Do you want to proceed anyway?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setShowProfileWarning(false);
              setPendingEmailData(null);
            }}
            color="error"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleProfileWarningConfirm}
            variant="contained"
            color="primary"
          >
            Send Anyway
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

// Missing LinearProgress component
function LinearProgress({ variant, value }) {
  return (
    <Box sx={{ width: '100%', bgcolor: '#e0e0e0', borderRadius: 1, height: 10, overflow: 'hidden' }}>
      <Box 
        sx={{ 
          width: `${value}%`, 
          bgcolor: 'primary.main', 
          height: '100%',
          transition: 'width 0.4s ease-in-out'
        }}
      />
    </Box>
  );
}

export default App;