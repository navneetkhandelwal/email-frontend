import React, { useState } from 'react';
import {
  Box, Button, Container, Paper, TextField, Typography, Grid, 
  Tabs, Tab, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, IconButton, CircularProgress, Snackbar, Alert,
  FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import EmailIcon from '@mui/icons-material/Email';
import DashboardIcon from '@mui/icons-material/Dashboard';
import axios from 'axios';

function App() {
  // Email credentials
  const [emailCredentials, setEmailCredentials] = useState({
    email: '',
    password: ''
  });
  
  // User selection
  const [selectedUser, setSelectedUser] = useState('navneet');
  const [customEmailBody, setCustomEmailBody] = useState('');
  
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

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
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
    setSelectedUser(e.target.value);
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

  // Submit email sending request
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

    setIsLoading(true);
    setEmailProgress({
      total: 0,
      current: 0,
      success: 0,
      failed: 0,
      logs: []
    });

    try {
      const formData = new FormData();
      formData.append('email', emailCredentials.email);
      formData.append('password', emailCredentials.password);
      formData.append('userType', selectedUser);
      
      if (selectedUser === 'other') {
        formData.append('customEmailBody', customEmailBody);
      }
      
      if (tabValue === 0) {
        // CSV upload mode
        formData.append('file', file);
        formData.append('mode', 'csv');
      } else {
        // Manual entry mode
        formData.append('data', JSON.stringify(manualEntries.filter(entry => 
          entry.Name && entry.Company && entry.Email && entry.Role
        )));
        formData.append('mode', 'manual');
      }

      // Get the appropriate API URL
      const apiUrl = process.env.NODE_ENV === 'production' ? 'https://email-backend-tf0l.onrender.com' : 'http://localhost:5000';

      // Use server-sent events to get real-time updates
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
      axios.post(`${apiUrl}/api/send-emails`, formData, {
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

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
          <DashboardIcon sx={{ mr: 2, fontSize: 32 }} color="primary" />
          <Typography variant="h4" component="h1">
            Email Campaign Dashboard
          </Typography>
        </Box>

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
              >
                <MenuItem value="navneet">Navneet</MenuItem>
                <MenuItem value="other">Other</MenuItem>
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
          <TableContainer component={Paper} sx={{ mb: 3 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Company</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Link (Optional)</TableCell>
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
                        placeholder="Job Link (Optional)"
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
          </TableContainer>
          <Button 
            variant="outlined" 
            startIcon={<AddIcon />} 
            onClick={addManualEntry}
          >
            Add Row
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