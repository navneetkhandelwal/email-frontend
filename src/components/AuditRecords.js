import React, { useState, useEffect } from 'react';
import axios from 'axios';
import axiosInstance from '../utils/axios';
import { useAuth } from '../contexts/AuthContext';
import useUserProfile from '../hooks/useUserProfile';
import {
  Box,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  IconButton,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  LinearProgress
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import ReplyIcon from '@mui/icons-material/Reply';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';

const AuditRecords = () => {
    const { user } = useAuth();
    const { userProfile } = useUserProfile();
    
    // States
    const [brocode, setBrocode] = useState('');
    const [isAuditUnlocked, setIsAuditUnlocked] = useState(false);
    const [brocodeError, setBrocodeError] = useState(false);
    const [page, setPage] = useState(1);
    const [selectedNameFilter, setSelectedNameFilter] = useState('all');
    const [emailAudit, setEmailAudit] = useState(null);
    const [isDeleteEnabled, setIsDeleteEnabled] = useState(false);
    const [showBulkReplyDialog, setShowBulkReplyDialog] = useState(false);
    const [bulkReplyDateRange, setBulkReplyDateRange] = useState({
      startDate: '',
      endDate: ''
    });
    const [bulkReplyProfile, setBulkReplyProfile] = useState('all');
    const [statusMessage, setStatusMessage] = useState({ type: '', message: '' });
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [showFollowUpDialog, setShowFollowUpDialog] = useState(false);
    const [showBulkFollowUpDialog, setShowBulkFollowUpDialog] = useState(false);
    const [showResendDialog, setShowResendDialog] = useState(false);
    const [followUpEmailCredentials, setFollowUpEmailCredentials] = useState({
      email: '',
      password: ''
    });
    const [followUpDateRange, setFollowUpDateRange] = useState({
      startDate: '',
      endDate: ''
    });
    const [showAppPasswordHelp, setShowAppPasswordHelp] = useState(false);
    const [emailProgress, setEmailProgress] = useState({
      total: 0,
      current: 0,
      success: 0,
      failed: 0,
      logs: []
    });
    const [showProfileWarning, setShowProfileWarning] = useState(false);
    const [pendingEmailData, setPendingEmailData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const rowsPerPage = 10;

    const nameOptions = [
      { value: 'all', label: 'All Users' },
      { value: 'navneet', label: 'Navneet' },
      { value: 'teghdeep', label: 'Teghdeep' },
      { value: 'divyam', label: 'Divyam' },
      { value: 'dhananjay', label: 'Dhananjay' },
      { value: 'akash', label: 'Akash' },
      { value: 'avi', label: 'Avi' },
      { value: 'komal', label: 'Komal' },
      { value: 'pooja', label: 'Pooja' }
    ];

    // Set current user as default filter when component mounts
    useEffect(() => {
        if (userProfile?.name) {
            setSelectedNameFilter(userProfile.name.toLowerCase());
        }
    }, [userProfile]);

    // Fetch email audit records
    const fetchEmailAudit = async () => {
      try {
        const response = await axiosInstance.get('/api/email-audit');
        if (response.data.success) {
          setEmailAudit(response.data);
        }
      } catch (error) {
        console.error('Error fetching email audit:', error);
        setStatusMessage({ 
          type: 'error', 
          message: error.response?.data?.message || 'Error fetching audit records' 
        });
        setOpenSnackbar(true);
      }
    };

    useEffect(() => {
      if (isAuditUnlocked) {
        fetchEmailAudit();
      }
    }, [isAuditUnlocked]);

    // Add this useEffect near the other useEffect hooks
    useEffect(() => {
      if (showBulkFollowUpDialog) {
        // Reset progress when dialog opens
        setEmailProgress({
          total: 0,
          current: 0,
          success: 0,
          failed: 0,
          logs: []
        });
      }
    }, [showBulkFollowUpDialog]);

    // Handler functions
    const handleBrocodeSubmit = () => {
      if (brocode === 'tandav') {
        setIsAuditUnlocked(true);
        setBrocodeError(false);
      } else {
        setBrocodeError(true);
        setIsAuditUnlocked(false);
      }
    };

    const handlePageChange = (event, newPage) => {
      setPage(newPage);
    };

    const handleNameFilterChange = (event) => {
      setSelectedNameFilter(event.target.value);
      setPage(1); // Reset to first page when filter changes
    };

    const getFilteredAndPaginatedRecords = (records) => {
      if (!records) return { paginatedRecords: [], totalRecords: 0 };
      
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

    const handleToggleReplyReceived = async (record) => {
      try {
        const response = await axiosInstance.post('/api/toggle-reply-received/' + record._id);
        
        if (response.data.success) {
          setStatusMessage({ 
            type: 'success', 
            message: 'Reply status updated successfully' 
          });
          setOpenSnackbar(true);
          await fetchEmailAudit();
        }
      } catch (error) {
        setStatusMessage({ 
          type: 'error', 
          message: error.response?.data?.message || 'Error updating reply status' 
        });
        setOpenSnackbar(true);
      }
    };

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
        const response = await axiosInstance.delete('/api/email-audit/' + recordId);
        
        if (response.data.success) {
          setStatusMessage({ 
            type: 'success', 
            message: response.data.message || 'Record deleted successfully' 
          });
          setOpenSnackbar(true);
          await fetchEmailAudit();
        }
      } catch (error) {
        setStatusMessage({ 
          type: 'error', 
          message: error.response?.data?.message || error.message || 'Error deleting record' 
        });
        setOpenSnackbar(true);
      }
    };

    const handleBulkReplyMark = async () => {
      try {
        const response = await axiosInstance.post('/api/bulk-mark-reply', {
          startDate: bulkReplyDateRange.startDate,
          endDate: bulkReplyDateRange.endDate,
          userProfile: bulkReplyProfile
        });
        
        if (response.data.success) {
          setStatusMessage({ 
            type: 'success', 
            message: `Successfully marked ${response.data.updatedCount} emails as replied` 
          });
          setOpenSnackbar(true);
          setShowBulkReplyDialog(false);
          // Reset form
          setBulkReplyDateRange({ startDate: '', endDate: '' });
          setBulkReplyProfile('all');
          // Refresh the audit records
          await fetchEmailAudit();
        }
      } catch (error) {
        setStatusMessage({ 
          type: 'error', 
          message: error.response?.data?.message || 'Error marking replies' 
        });
        setOpenSnackbar(true);
      }
    };

    const capitalizeFirstLetter = (string) => {
      if (!string) return '';
      return string.charAt(0).toUpperCase() + string.slice(1);
    };

    const handleSendBulkFollowUp = async () => {
      try {
        if (!followUpEmailCredentials.email || !followUpEmailCredentials.password) {
          setStatusMessage({ 
            type: 'error', 
            message: 'Email credentials are required' 
          });
          setOpenSnackbar(true);
          return;
        }

        if (!followUpDateRange.startDate || !followUpDateRange.endDate) {
          setStatusMessage({ 
            type: 'error', 
            message: 'Date range is required' 
          });
          setOpenSnackbar(true);
          return;
        }

        if (!selectedNameFilter) {
          setStatusMessage({
            type: 'error',
            message: 'Please select a user profile'
          });
          setOpenSnackbar(true);
          return;
        }

        // Check if email contains profile name
        if (!followUpEmailCredentials.email.toLowerCase().includes(selectedNameFilter.toLowerCase())) {
          setShowProfileWarning(true);
          setPendingEmailData({
            type: 'bulk',
            data: {
              startDate: followUpDateRange.startDate,
              endDate: followUpDateRange.endDate,
              email: followUpEmailCredentials.email,
              password: followUpEmailCredentials.password,
              userType: selectedNameFilter
            }
          });
          return;
        }

        // Initialize progress state before starting
        setEmailProgress({
          total: 0,
          current: 0,
          success: 0,
          failed: 0,
          logs: ['Initializing follow-up process...']
        });

        await sendBulkFollowUpEmails();
      } catch (error) {
        handleEmailError(error);
      }
    };

    const sendBulkFollowUpEmails = async () => {
      try {
        // Close any existing event source
        if (window.eventSource) {
          window.eventSource.close();
        }

        // Set up SSE connection for progress updates BEFORE sending request
        window.eventSource = new EventSource('http://localhost:5001/api/send-emails-sse?email=' + followUpEmailCredentials.email);
        
        // Initialize progress state
        setEmailProgress({
          total: 0,
          current: 0,
          success: 0,
          failed: 0,
          logs: ['Connecting to server...']
        });

        // Set up event handlers
        window.eventSource.onopen = () => {
          console.log('SSE connection opened');
          setEmailProgress(prev => ({
            ...prev,
            logs: [...prev.logs, 'Connected to server']
          }));
        };

        window.eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log('SSE Event received:', data);

            if (data.type === 'connected') {
              console.log('SSE connected event received');
              setEmailProgress(prev => ({
                ...prev,
                logs: [...prev.logs, 'Ready to send emails']
              }));
            } else if (data.type === 'progress') {
              console.log('Progress update received:', data);
              setEmailProgress(prev => ({
                ...prev,
                total: data.total,
                current: data.current,
                success: data.success,
                failed: data.failed,
                logs: [...prev.logs, `Progress: ${data.current}/${data.total}`]
              }));
            } else if (data.type === 'log') {
              console.log('Log message received:', data.message);
              setEmailProgress(prev => ({
                ...prev,
                logs: [...prev.logs, data.message]
              }));
            } else if (data.type === 'complete') {
              console.log('Complete event received:', data);
              window.eventSource.close();
              setStatusMessage({ 
                type: 'success', 
                message: `Successfully sent ${data.success} follow-up emails (${data.failed} failed)` 
              });
              setShowBulkFollowUpDialog(false);
              setFollowUpEmailCredentials({ email: '', password: '' });
              setFollowUpDateRange({ startDate: '', endDate: '' });
              fetchEmailAudit();
              setOpenSnackbar(true);
            }
          } catch (error) {
            console.error('Error parsing SSE message:', error);
            window.eventSource.close();
            setStatusMessage({ 
              type: 'error', 
              message: 'Error processing server updates' 
            });
            setOpenSnackbar(true);
          }
        };

        window.eventSource.onerror = (error) => {
          console.error('SSE Error:', error);
          window.eventSource.close();
          setStatusMessage({ 
            type: 'error', 
            message: 'Lost connection to server' 
          });
          setOpenSnackbar(true);
        };

        setStatusMessage({ 
          type: 'info', 
          message: 'Sending bulk follow-up emails...' 
        });
        
        // Send the request to start the bulk follow-up process
        const response = await axiosInstance.post('/api/send-bulk-followup', {
          startDate: followUpDateRange.startDate,
          endDate: followUpDateRange.endDate,
          email: followUpEmailCredentials.email,
          password: followUpEmailCredentials.password,
          userType: selectedNameFilter
        });

        if (!response.data.success) {
          throw new Error(response.data.message || 'Failed to start bulk follow-up process');
        }

      } catch (error) {
        if (window.eventSource) {
          window.eventSource.close();
        }
        handleEmailError(error);
      }
    };

    const handleProfileWarningConfirm = async () => {
      setShowProfileWarning(false);
      if (pendingEmailData) {
        if (pendingEmailData.type === 'bulk') {
          await sendBulkFollowUpEmails();
        } else {
          await handleSendFollowUp(pendingEmailData.data);
        }
        setPendingEmailData(null);
      }
    };

    const handleEmailError = (error) => {
      console.error('Email error:', error);
      setStatusMessage({ 
        type: 'error', 
        message: error.response?.data?.message || error.message || 'Error sending email' 
      });
      setOpenSnackbar(true);
    };

    const handleSendFollowUp = async (record) => {
      try {
        if (!followUpEmailCredentials.email || !followUpEmailCredentials.password) {
          setStatusMessage({ 
            type: 'error', 
            message: 'Email credentials are required' 
          });
          setOpenSnackbar(true);
          return;
        }

        // Show sending status
        setIsLoading(true);
        setStatusMessage({
          type: 'info',
          message: `Sending follow-up email to ${record.email}...`
        });
        setOpenSnackbar(true);

        const response = await axiosInstance.post('/api/send-followup', {
          recordId: record._id,
          userType: userProfile.name.toLowerCase(),
          email: followUpEmailCredentials.email,
          password: followUpEmailCredentials.password
        });

        if (response.data.success) {
          setIsLoading(false);
          setStatusMessage({ 
            type: 'success', 
            message: `Successfully sent follow-up email to ${record.email}` 
          });
          setShowFollowUpDialog(false);
          setFollowUpEmailCredentials({ email: '', password: '' });
          await fetchEmailAudit();
        }
      } catch (error) {
        handleEmailError(error);
      }
    };

    const handleResendEmail = async (record) => {
      try {
        if (!followUpEmailCredentials.email || !followUpEmailCredentials.password) {
          setStatusMessage({ 
            type: 'error', 
            message: 'Email credentials are required' 
          });
          setOpenSnackbar(true);
          return;
        }

        setIsLoading(true);
        setStatusMessage({
          type: 'info',
          message: `Resending email to ${record.email}...`
        });
        setOpenSnackbar(true);

        const response = await axiosInstance.post('/api/resend-email', {
          recordId: record._id,
          userType: userProfile.name.toLowerCase(),
          email: followUpEmailCredentials.email,
          password: followUpEmailCredentials.password
        });

        if (response.data.success) {
          setIsLoading(false);
          setStatusMessage({ 
            type: 'success', 
            message: `Successfully resent email to ${record.email}` 
          });
          setShowResendDialog(false);
          setFollowUpEmailCredentials({ email: '', password: '' });
          await fetchEmailAudit();
        }
      } catch (error) {
        handleEmailError(error);
      }
    };

    // Add cleanup on component unmount
    useEffect(() => {
      return () => {
        if (window.eventSource) {
          window.eventSource.close();
        }
      };
    }, []);

    return (
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
            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
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
              <Button
                variant="contained"
                color="primary"
                onClick={() => setShowBulkReplyDialog(true)}
                startIcon={<ReplyIcon />}
              >
                Bulk Mark Replies
              </Button>
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
                    <TableCell>Type</TableCell>
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
                            display: 'flex', 
                            alignItems: 'center',
                            gap: 1
                          }}>
                            <Box sx={{ 
                              display: 'inline-flex', 
                              alignItems: 'center',
                              color: record.status === 'success' ? 'success.main' : 'error.main',
                              fontWeight: 500
                            }}>
                              {record.status === 'success' ? '✓' : '✗'} {record.status}
                            </Box>
                            <Checkbox
                              checked={record.replyReceived}
                              onChange={() => handleToggleReplyReceived(record)}
                              color="primary"
                              size="small"
                              sx={{ ml: 1 }}
                            />
                            <Typography variant="caption" color="textSecondary">
                              Reply Received
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="body2"
                            color={record.emailType === 'Follow-up Email' ? 'secondary.main' : 'primary.main'}
                            sx={{ fontWeight: 500 }}
                          >
                            {record.emailType || 'Main Email'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {new Date(record.createdAt).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                              variant="outlined"
                              size="small"
                              color="secondary"
                              onClick={() => {
                                setSelectedRecord(record);
                                setShowFollowUpDialog(true);
                              }}
                              disabled={
                                record.replyReceived || 
                                record.emailType === 'Follow-up Email' ||
                                !record.threadId ||
                                !record.messageId ||
                                !record.emailType
                              }
                              startIcon={<ReplyIcon />}
                              sx={{
                                minWidth: 'auto',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              Follow Up
                            </Button>
                            <Button
                              variant="outlined"
                              size="small"
                              color="primary"
                              onClick={() => {
                                setSelectedRecord(record);
                                setShowResendDialog(true);
                              }}
                              startIcon={<RefreshIcon />}
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

            {/* Add Bulk Follow-up Button */}
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                color="secondary"
                onClick={() => {
                  setEmailProgress({
                    total: 0,
                    current: 0,
                    success: 0,
                    failed: 0,
                    logs: []
                  });
                  setShowBulkFollowUpDialog(true);
                }}
                startIcon={<ReplyIcon />}
              >
                Bulk Follow-up
              </Button>
            </Box>
          </Box>
        )}

        {/* Bulk Reply Dialog */}
        <Dialog
          open={showBulkReplyDialog}
          onClose={() => setShowBulkReplyDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Mark Replies</DialogTitle>
          <DialogContent>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Select users to mark their replies as received
            </Typography>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="bulk-reply-profile-label">Select Profile</InputLabel>
              <Select
                labelId="bulk-reply-profile-label"
                id="bulk-reply-profile"
                value={bulkReplyProfile}
                label="Select Profile"
                onChange={(e) => setBulkReplyProfile(e.target.value)}
              >
                {nameOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Start Date"
              type="date"
              value={bulkReplyDateRange.startDate}
              onChange={(e) => setBulkReplyDateRange(prev => ({
                ...prev,
                startDate: e.target.value
              }))}
              InputLabelProps={{ shrink: true }}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="End Date"
              type="date"
              value={bulkReplyDateRange.endDate}
              onChange={(e) => setBulkReplyDateRange(prev => ({
                ...prev,
                endDate: e.target.value
              }))}
              InputLabelProps={{ shrink: true }}
              sx={{ mb: 2 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowBulkReplyDialog(false)}>Cancel</Button>
            <Button 
              onClick={handleBulkReplyMark}
              variant="contained"
              color="primary"
              disabled={!bulkReplyDateRange.startDate || !bulkReplyDateRange.endDate}
            >
              Mark Replies
            </Button>
          </DialogActions>
        </Dialog>

        {/* Bulk Follow-up Dialog */}
        <Dialog 
          open={showBulkFollowUpDialog} 
          onClose={() => {
            setShowBulkFollowUpDialog(false);
            setFollowUpEmailCredentials({ email: '', password: '' });
            setFollowUpDateRange({ startDate: '', endDate: '' });
            setEmailProgress({
              total: 0,
              current: 0,
              success: 0,
              failed: 0,
              logs: []
            });
          }}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Send Bulk Follow-up Emails</DialogTitle>
          <DialogContent>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Send follow-up emails to all unreplied emails within the selected date range
            </Typography>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Select User Profile</InputLabel>
              <Select
                value={selectedNameFilter}
                onChange={handleNameFilterChange}
                label="Select User Profile"
              >
                {nameOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Start Date"
              type="date"
              value={followUpDateRange.startDate}
              onChange={(e) => setFollowUpDateRange(prev => ({ ...prev, startDate: e.target.value }))}
              InputLabelProps={{ shrink: true }}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="End Date"
              type="date"
              value={followUpDateRange.endDate}
              onChange={(e) => setFollowUpDateRange(prev => ({ ...prev, endDate: e.target.value }))}
              InputLabelProps={{ shrink: true }}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={followUpEmailCredentials.email}
              onChange={(e) => setFollowUpEmailCredentials(prev => ({ ...prev, email: e.target.value }))}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="App Password"
              type="password"
              value={followUpEmailCredentials.password}
              onChange={(e) => setFollowUpEmailCredentials(prev => ({ ...prev, password: e.target.value }))}
              sx={{ mb: 1 }}
            />
            <Button
              size="small"
              onClick={() => setShowAppPasswordHelp(!showAppPasswordHelp)}
              sx={{ mb: 2 }}
            >
              {showAppPasswordHelp ? 'Hide Help' : 'Show Help'} with App Password
            </Button>
            {showAppPasswordHelp && (
              <Paper sx={{ p: 2, mb: 2, bgcolor: '#fff3e0' }}>
                <Typography variant="subtitle2" color="warning.main" gutterBottom>
                  How to generate an App Password:
                </Typography>
                <Typography variant="body2" component="div">
                  <ol style={{ margin: 0, paddingLeft: '1.2em' }}>
                    <li>Go to your Google Account settings</li>
                    <li>Navigate to Security → 2-Step Verification</li>
                    <li>Scroll to the bottom and click on "App passwords"</li>
                    <li>Generate a new App password for "Mail"</li>
                    <li>Use the 16-character password generated</li>
                  </ol>
                </Typography>
                <Button
                  component="a"
                  href="https://myaccount.google.com/apppasswords"
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="outlined"
                  size="small"
                  sx={{ mt: 1 }}
                >
                  Open Google App Passwords
                </Button>
              </Paper>
            )}
            {/* Progress Section */}
            <Box sx={{ mt: 2, mb: 2 }}>
              {emailProgress.logs.length > 0 && (
                <>
                  <Typography variant="body1" color="primary" align="center" sx={{ mb: 2 }}>
                    {emailProgress.current > 0 ? 'Email sending in progress...' : 'Initializing...'}
                  </Typography>
                  {emailProgress.total > 0 && (
                    <>
                      <LinearProgress 
                        variant="determinate" 
                        value={(emailProgress.current / emailProgress.total) * 100} 
                        sx={{ mb: 1 }}
                      />
                      <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 1 }}>
                        {emailProgress.current}/{emailProgress.total} emails sent
                        ({emailProgress.success} success, {emailProgress.failed} failed)
                      </Typography>
                    </>
                  )}
                  <Paper 
                    sx={{ 
                      p: 2, 
                      maxHeight: 150, 
                      overflowY: 'auto',
                      bgcolor: 'background.default'
                    }}
                  >
                    {emailProgress.logs.map((log, index) => (
                      <Typography 
                        key={index} 
                        variant="caption" 
                        display="block" 
                        color="text.secondary"
                        sx={{ mb: 0.5 }}
                      >
                        {log}
                      </Typography>
                    ))}
                  </Paper>
                </>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {
              setShowBulkFollowUpDialog(false);
              setFollowUpEmailCredentials({ email: '', password: '' });
              setFollowUpDateRange({ startDate: '', endDate: '' });
              setEmailProgress({
                total: 0,
                current: 0,
                success: 0,
                failed: 0,
                logs: []
              });
            }}>
              Cancel
            </Button>
            <Button 
              onClick={handleSendBulkFollowUp}
              variant="contained"
              disabled={emailProgress.current > 0}
            >
              {emailProgress.current > 0 ? 'Sending...' : 'Send Bulk Follow-ups'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Resend Dialog */}
        <Dialog
          open={showResendDialog}
          onClose={() => {
            setShowResendDialog(false);
            setFollowUpEmailCredentials({ email: '', password: '' });
          }}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Resend Email</DialogTitle>
          <DialogContent>
            {selectedRecord && (
              <>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  Resend email to {selectedRecord.email} using your template
                </Typography>
                <Box sx={{ mb: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                  <Typography variant="subtitle2">Original Email Details:</Typography>
                  <Typography variant="body2">Name: {selectedRecord.name}</Typography>
                  <Typography variant="body2">Company: {selectedRecord.company}</Typography>
                  <Typography variant="body2">Role: {selectedRecord.role}</Typography>
                </Box>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={followUpEmailCredentials.email}
                  onChange={(e) => setFollowUpEmailCredentials(prev => ({ ...prev, email: e.target.value }))}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="App Password"
                  type="password"
                  value={followUpEmailCredentials.password}
                  onChange={(e) => setFollowUpEmailCredentials(prev => ({ ...prev, password: e.target.value }))}
                  sx={{ mb: 1 }}
                />
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {
              setShowResendDialog(false);
              setFollowUpEmailCredentials({ email: '', password: '' });
            }}>
              Cancel
            </Button>
            <Button 
              onClick={() => handleResendEmail(selectedRecord)}
              variant="contained"
              disabled={isLoading}
            >
              {isLoading ? 'Sending...' : 'Resend Email'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Profile Warning Dialog */}
        <Dialog
          open={showProfileWarning}
          onClose={() => setShowProfileWarning(false)}
        >
          <DialogTitle>Warning</DialogTitle>
          <DialogContent>
            <Typography>
              The email address you entered doesn't match the selected profile. Are you sure you want to proceed?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowProfileWarning(false)}>Cancel</Button>
            <Button onClick={handleProfileWarningConfirm} variant="contained">
              Proceed
            </Button>
          </DialogActions>
        </Dialog>

        {/* Follow-up Dialog */}
        <Dialog
          open={showFollowUpDialog}
          onClose={() => {
            setShowFollowUpDialog(false);
            setFollowUpEmailCredentials({ email: '', password: '' });
          }}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Send Follow-up Email</DialogTitle>
          <DialogContent>
            {selectedRecord && (
              <>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  Send follow-up email to {selectedRecord.email}
                </Typography>
                <Box sx={{ mb: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                  <Typography variant="subtitle2">Original Email Details:</Typography>
                  <Typography variant="body2">Name: {selectedRecord.name}</Typography>
                  <Typography variant="body2">Company: {selectedRecord.company}</Typography>
                  <Typography variant="body2">Role: {selectedRecord.role}</Typography>
                </Box>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={followUpEmailCredentials.email}
                  onChange={(e) => setFollowUpEmailCredentials(prev => ({ ...prev, email: e.target.value }))}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="App Password"
                  type="password"
                  value={followUpEmailCredentials.password}
                  onChange={(e) => setFollowUpEmailCredentials(prev => ({ ...prev, password: e.target.value }))}
                  sx={{ mb: 1 }}
                />
                <Button
                  size="small"
                  onClick={() => setShowAppPasswordHelp(!showAppPasswordHelp)}
                  sx={{ mb: 2 }}
                >
                  {showAppPasswordHelp ? 'Hide Help' : 'Show Help'} with App Password
                </Button>
                {showAppPasswordHelp && (
                  <Paper sx={{ p: 2, mb: 2, bgcolor: '#fff3e0' }}>
                    <Typography variant="subtitle2" color="warning.main" gutterBottom>
                      How to generate an App Password:
                    </Typography>
                    <Typography variant="body2" component="div">
                      <ol style={{ margin: 0, paddingLeft: '1.2em' }}>
                        <li>Go to your Google Account settings</li>
                        <li>Navigate to Security → 2-Step Verification</li>
                        <li>Scroll to the bottom and click on "App passwords"</li>
                        <li>Generate a new App password for "Mail"</li>
                        <li>Use the 16-character password generated</li>
                      </ol>
                    </Typography>
                    <Button
                      component="a"
                      href="https://myaccount.google.com/apppasswords"
                      target="_blank"
                      rel="noopener noreferrer"
                      variant="outlined"
                      size="small"
                      sx={{ mt: 1 }}
                    >
                      Open Google App Passwords
                    </Button>
                  </Paper>
                )}
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {
              setShowFollowUpDialog(false);
              setFollowUpEmailCredentials({ email: '', password: '' });
            }}>
              Cancel
            </Button>
            <Button 
              onClick={() => handleSendFollowUp(selectedRecord)}
              variant="contained"
              disabled={isLoading}
            >
              {isLoading ? 'Sending...' : 'Send Follow-up'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar for notifications */}
        <Snackbar
          open={openSnackbar}
          autoHideDuration={6000}
          onClose={() => setOpenSnackbar(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            onClose={() => setOpenSnackbar(false)} 
            severity={statusMessage.type}
            sx={{ width: '100%' }}
          >
            {statusMessage.message}
          </Alert>
        </Snackbar>
      </Box>
    );
};

export default AuditRecords;