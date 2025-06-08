import React, { useState, useEffect } from 'react';
import {
  Box, Button, Container, Paper, TextField, Typography, Grid, 
  Tabs, Tab, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, IconButton, CircularProgress, LinearProgress, Snackbar, Alert,
  FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import EmailIcon from '@mui/icons-material/Email';
import axiosInstance from '../utils/axios';
import { useAuth } from '../contexts/AuthContext';
import useUserProfile from '../hooks/useUserProfile';

const UserSelection = () => {
    const { user } = useAuth();
    const { userProfile } = useUserProfile();
    
    //tab
    const [tabValue, setTabValue] = useState(0);
    
    // Email credentials
    const [emailCredentials, setEmailCredentials] = useState({
        email: '',
        password: ''
    });
    
    // User selection - set current user as default
    const [selectedUser, setSelectedUser] = useState('');
    const [customEmailBody, setCustomEmailBody] = useState('');
    
    // User profiles for display names
    const [userProfiles, setUserProfiles] = useState([]);
    
    // Fetch user profiles
    useEffect(() => {
        const fetchUserProfiles = async () => {
            try {
                const response = await axiosInstance.get('/api/user-profiles');
                if (response.data && response.data.userProfiles) {
                    setUserProfiles(response.data.userProfiles);
                }
            } catch (error) {
                console.error('Error fetching user profiles:', error);
            }
        };
        fetchUserProfiles();
    }, []);

    // Set the current user as default when component mounts
    useEffect(() => {
        if (userProfile?.name) {
            setSelectedUser(userProfile.name.toLowerCase());
        }
    }, [userProfile]);
    
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
        const newUserType = e.target.value.toLowerCase(); // Ensure lowercase for backend
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

    const handleEmailError = (error) => {
        setStatusMessage({ 
            type: 'error', 
            message: error.response?.data?.message || 'Error sending emails' 
        });
        setOpenSnackbar(true);
    };

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
        // Initialize with the correct total right away
        const validEntries = manualEntries.filter(entry => 
            entry.Name && entry.Company && entry.Email && entry.Role
        );
        setEmailProgress({
            total: validEntries.length,
            current: 0,
            success: 0,
            failed: 0,
            logs: []
        });

        let eventSource = null;
        let isCompleted = false;

        try {
            const requestData = {
                email: emailCredentials.email,
                password: emailCredentials.password,
                userType: selectedUser,
                mode: tabValue === 0 ? 'csv' : 'manual',
                data: JSON.stringify(validEntries)
            };
            
            if (selectedUser === 'other') {
                requestData.customEmailBody = customEmailBody;
            }

            console.log('Setting up SSE connection...');
            eventSource = new EventSource('http://localhost:5001/api/send-emails-sse?email=' + emailCredentials.email);
            
            setEmailProgress(prev => ({
                ...prev,
                logs: [...prev.logs, `Starting email sending process for ${validEntries.length} recipients`]
            }));

            eventSource.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);

                    if (data.type === 'log') {
                        const message = data.message;
                        const successMatch = message.match(/(\d+)\/(\d+): Successfully sent email to/);
                        if (successMatch) {
                            const current = parseInt(successMatch[1]);
                            setEmailProgress(prev => ({
                                ...prev,
                                current: current,
                                success: current,
                                logs: [...prev.logs, message]
                            }));
                        } else if (message.includes('failed')) {
                            const failedMatch = message.match(/(\d+)\/(\d+):/);
                            const current = failedMatch ? parseInt(failedMatch[1]) : (prev => prev.current + 1);
                            setEmailProgress(prev => ({
                                ...prev,
                                current: typeof current === 'number' ? current : prev.current + 1,
                                failed: prev.failed + 1,
                                logs: [...prev.logs, message]
                            }));
                        } else {
                            setEmailProgress(prev => ({
                                ...prev,
                                logs: [...prev.logs, message]
                            }));
                        }
                    } else if (data.type === 'progress') {
                        setEmailProgress(prev => ({
                            ...prev,
                            current: Math.max(prev.current, parseInt(data.current)),
                            success: Math.max(prev.success, parseInt(data.success || 0)),
                            failed: Math.max(prev.failed, parseInt(data.failed || 0))
                        }));
                    } else if (data.type === 'complete' && !isCompleted) {
                        isCompleted = true;
                        setEmailProgress(prev => ({
                            ...prev,
                            current: data.current,
                            success: data.success,
                            failed: data.failed,
                            total: data.total
                        }));

                        setTimeout(() => {
                            if (eventSource) {
                                eventSource.close();
                            }
                            setIsLoading(false);
                            setStatusMessage({ 
                                type: 'success', 
                                message: `Completed sending emails. Success: ${data.success}, Failed: ${data.failed}` 
                            });
                            setOpenSnackbar(true);
                        }, 1000);
                    }
                } catch (error) {
                    console.error('Error processing SSE message:', error);
                }
            };

            eventSource.onerror = (error) => {
                if (eventSource) {
                    eventSource.close();
                }
                setIsLoading(false);
                setStatusMessage({ 
                    type: 'error', 
                    message: 'Error during email sending process' 
                });
                setOpenSnackbar(true);
            };

            let response;
            if (tabValue === 0 && file) {
                const formData = new FormData();
                Object.entries(requestData).forEach(([key, value]) => {
                    formData.append(key, value);
                });
                formData.append('file', file);
                
                response = await axiosInstance.post('/api/send-emails', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
            } else {
                response = await axiosInstance.post('/api/send-emails', requestData, {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
            }
            
            if (response.data.success) {
                setStatusMessage({ 
                    type: 'success', 
                    message: tabValue === 0 ? 'Started sending emails from CSV file' : 'Started sending manual emails'
                });
                setOpenSnackbar(true);
            }
            
        } catch (error) {
            console.error('Error in handleSendEmails:', error);
            if (eventSource) {
                eventSource.close();
            }
            setIsLoading(false);
            handleEmailError(error);
        }
    };

    return (
        <>
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
                            >
                                {userProfile && (
                                    <MenuItem value={userProfile.name.toLowerCase()}>
                                        {userProfile.displayName || userProfile.name}
                                    </MenuItem>
                                )}
                                <MenuItem value="other">Other</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>

                {/* Custom Email Body Section */}
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
                    <Box sx={{ 
                        mt: 4,
                        p: 3,
                        bgcolor: '#f8f9fa',
                        borderRadius: 2,
                        border: '1px solid #e0e0e0',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                    }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
                            <CircularProgress size={20} sx={{ mr: 1.5 }} />
                            <Typography variant="h6" color="primary">
                                Email Sending in Progress
                            </Typography>
                        </Box>

                        {/* Progress Bar and Percentage */}
                        <Box sx={{ position: 'relative', mb: 3 }}>
                            <LinearProgress 
                                variant="determinate" 
                                value={emailProgress.total > 0 ? (emailProgress.current / emailProgress.total) * 100 : 0} 
                                sx={{ 
                                    height: 10, 
                                    borderRadius: 5,
                                    bgcolor: '#e3f2fd',
                                    '& .MuiLinearProgress-bar': {
                                        borderRadius: 5,
                                        bgcolor: '#2196f3'
                                    }
                                }}
                            />
                            <Typography 
                                variant="body2" 
                                color="primary"
                                sx={{ 
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    fontWeight: 'bold',
                                    textShadow: '0 0 4px white'
                                }}
                            >
                                {emailProgress.total > 0 ? Math.round((emailProgress.current / emailProgress.total) * 100) : 0}%
                            </Typography>
                        </Box>

                        {/* Status Counters */}
                        <Box sx={{ 
                            display: 'flex', 
                            justifyContent: 'center', 
                            gap: 4, 
                            mb: 3,
                            '& > div': {
                                textAlign: 'center',
                                px: 2,
                                py: 1,
                                borderRadius: 1,
                                minWidth: 120
                            }
                        }}>
                            <Box sx={{ bgcolor: '#e8f5e9' }}>
                                <Typography variant="h6" color="success.main" sx={{ fontWeight: 'bold' }}>
                                    {emailProgress.success}
                                </Typography>
                                <Typography variant="body2" color="success.main">
                                    Successful
                                </Typography>
                            </Box>
                            <Box sx={{ bgcolor: '#fbe9e7' }}>
                                <Typography variant="h6" color="error.main" sx={{ fontWeight: 'bold' }}>
                                    {emailProgress.failed}
                                </Typography>
                                <Typography variant="body2" color="error.main">
                                    Failed
                                </Typography>
                            </Box>
                        </Box>

                        {/* Progress Counter */}
                        <Typography variant="body1" align="center" sx={{ mb: 2, fontWeight: 500 }}>
                            Processing: {emailProgress.current} of {emailProgress.total} emails
                        </Typography>

                        {/* Log Messages */}
                        <Box sx={{ 
                            maxHeight: '150px', 
                            overflow: 'auto',
                            bgcolor: '#fff',
                            borderRadius: 1,
                            p: 2,
                            border: '1px solid #e0e0e0'
                        }}>
                            {emailProgress.logs.filter((log, index, self) => 
                                !log.includes('Starting email sending process') || 
                                self.findIndex(l => l.includes('Starting email sending process')) === index
                            ).map((log, index) => (
                                <Typography 
                                    key={index} 
                                    variant="body2" 
                                    sx={{ 
                                        py: 0.5,
                                        color: log.includes('Success') ? 'success.main' : 
                                               log.includes('Failed') ? 'error.main' : 
                                               log.includes('Starting') ? 'primary.main' : 
                                               'text.primary'
                                    }}
                                >
                                    {log}
                                </Typography>
                            ))}
                        </Box>
                    </Box>
                )}
            </Box>
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
        </>
    );
};

export default UserSelection;