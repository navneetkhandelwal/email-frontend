import React, { useState, useEffect } from 'react';
import {
  Box, Button, Container, Paper, TextField, Typography, Grid, 
  Tabs, Tab, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, IconButton, CircularProgress, LinearProgress, Snackbar, Alert,
  FormControl, InputLabel, Select, MenuItem, Pagination, Dialog, DialogTitle, 
  DialogContent, DialogActions, Divider, Checkbox
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import EmailIcon from '@mui/icons-material/Email';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ReplyIcon from '@mui/icons-material/Reply';
import SendIcon from '@mui/icons-material/Send';
import axios from 'axios';

function App() {
  //tab
  const [tabIndex, setTabIndex] = useState(0);
  const [showManualDialog, setShowManualDialog] = useState(false);

  const handleEmailError = (error) => {
    // Check if it's an authentication error
    if (error.response?.status === 401 || 
        error.response?.data?.error?.code === 'EAUTH' ||
        (error.response?.data?.error?.response || '').includes('Authentication Required')) {
      setShowAppPasswordHelp(true);
      setStatusMessage({ 
        type: 'error', 
        message: 'Gmail authentication failed. Please use an App Password.' 
      });
    } else {
      setStatusMessage({ 
        type: 'error', 
        message: error.response?.data?.message || 'Error sending emails' 
      });
    }
    setOpenSnackbar(true);
  };

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

  // Add these new states after other state declarations
  const [currentTemplate, setCurrentTemplate] = useState('');
  const [newTemplate, setNewTemplate] = useState('');
  const [isTemplateLoading, setIsTemplateLoading] = useState(false);
  const [isTemplateTabUnlocked, setIsTemplateTabUnlocked] = useState(false);
  const [templateBrocode, setTemplateBrocode] = useState('');
  const [templateBrocodeError, setTemplateBrocodeError] = useState(false);

  // Add these states after other state declarations
  const [selectedTemplateId, setSelectedTemplateId] = useState('1');
  const [previewTemplate, setPreviewTemplate] = useState('');

  // Add this state for template tabs
  const [templateTabIndex, setTemplateTabIndex] = useState(0);

  // Add these new states after other state declarations
  const [showFollowUpDialog, setShowFollowUpDialog] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [followUpDateRange, setFollowUpDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [showBulkFollowUpDialog, setShowBulkFollowUpDialog] = useState(false);
  const [followUpEmailCredentials, setFollowUpEmailCredentials] = useState({
    email: '',
    password: ''
  });

  // Add these new states after other state declarations
  const [followUpTemplate, setFollowUpTemplate] = useState('');
  const [isFollowUpTemplateLoading, setIsFollowUpTemplateLoading] = useState(false);

  // Add this state for showing help text
  const [showAppPasswordHelp, setShowAppPasswordHelp] = useState(false);

  // Add these state declarations near other states
  const [showBulkReplyDialog, setShowBulkReplyDialog] = useState(false);
  const [bulkReplyDateRange, setBulkReplyDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [bulkReplyProfile, setBulkReplyProfile] = useState('all');

  // Add this handler function
  const handleToggleReplyReceived = async (record) => {
    try {
      const apiUrl = process.env.NODE_ENV === 'production' 
        ? 'https://email-backend-tf0l.onrender.com' 
        : 'http://localhost:5001';

      const response = await axios.post(`${apiUrl}/api/toggle-reply-received/${record._id}`);
      
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

  // Add this handler function
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

      const apiUrl = process.env.NODE_ENV === 'production' 
        ? 'https://email-backend-tf0l.onrender.com' 
        : 'http://localhost:5001';

      const response = await axios.post(`${apiUrl}/api/send-followup`, {
        recordId: record._id,
        userType: record.userProfile,
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
      console.error('Follow-up error:', error.response?.data || error);
      
      // Always clear loading state
      setIsLoading(false);
      
      // Check if it's an authentication error
      if (error.response?.status === 401 || 
          error.response?.data?.error?.code === 'EAUTH' ||
          (error.response?.data?.error?.response || '').includes('Authentication Required')) {
        setShowAppPasswordHelp(true);
        setStatusMessage({ 
          type: 'error', 
          message: 'Gmail authentication failed. Please use an App Password.' 
        });
      } else {
        setStatusMessage({ 
          type: 'error', 
          message: error.response?.data?.message || `Failed to send follow-up email: ${error.message}` 
        });
      }
      setOpenSnackbar(true);
    }
  };

  // Add this handler function
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

      if (!selectedUser) {
        setStatusMessage({
          type: 'error',
          message: 'Please select a user profile'
        });
        setOpenSnackbar(true);
        return;
      }

      // Check if email contains profile name
      if (!followUpEmailCredentials.email.toLowerCase().includes(selectedUser.toLowerCase())) {
        setShowProfileWarning(true);
        setPendingEmailData({
          type: 'bulk',
          data: {
            startDate: followUpDateRange.startDate,
            endDate: followUpDateRange.endDate,
            email: followUpEmailCredentials.email,
            password: followUpEmailCredentials.password,
            userType: selectedUser
          }
        });
        return;
      }

      await sendBulkFollowUpEmails();
    } catch (error) {
      handleEmailError(error);
    }
  };

  const sendBulkFollowUpEmails = async () => {
    try {
      const apiUrl = process.env.NODE_ENV === 'production' 
        ? 'https://email-backend-tf0l.onrender.com' 
        : 'http://localhost:5001';

      // Set up SSE connection for progress updates BEFORE sending request
      const eventSource = new EventSource(`${apiUrl}/api/send-emails-sse?email=${followUpEmailCredentials.email}`);
      
      // Initialize progress
      setEmailProgress({
        total: 0,
        current: 0,
        success: 0,
        failed: 0,
        logs: ['Starting follow-up process...']
      });

      // Set up event handlers
      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('SSE Event:', data);

          if (data.type === 'progress') {
            console.log('Progress update:', data); // Debug log
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
            console.log('Complete event:', data); // Debug log
            eventSource.close();
            setIsLoading(false);
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
          eventSource.close();
          setIsLoading(false);
          setStatusMessage({ 
            type: 'error', 
            message: 'Error processing server updates' 
          });
          setOpenSnackbar(true);
        }
      };

      eventSource.onerror = (error) => {
        console.error('SSE Error:', error);
        eventSource.close();
        setIsLoading(false);
        setStatusMessage({ 
          type: 'error', 
          message: 'Lost connection to server' 
        });
        setOpenSnackbar(true);
      };

      setIsLoading(true);
      
      // Send the request to start the bulk follow-up process
      const response = await axios.post(`${apiUrl}/api/send-bulk-followup`, {
        startDate: followUpDateRange.startDate,
        endDate: followUpDateRange.endDate,
        email: followUpEmailCredentials.email,
        password: followUpEmailCredentials.password,
        userType: selectedUser
      });

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to start bulk follow-up process');
      }

      // Wait for completion
      await new Promise((resolve) => {
        const checkInterval = setInterval(() => {
          if (!isLoading) {
            clearInterval(checkInterval);
            resolve();
          }
        }, 1000);
      });

    } catch (error) {
      handleEmailError(error);
      setIsLoading(false);
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

  // Add handler for template tab change
  const handleTemplateTabChange = (event, newValue) => {
    setTemplateTabIndex(newValue);
  };

  // Add this helper function to extract content and apply new styling
  const applyTemplateStyle = (contentTemplate, styleTemplate) => {
    if (!contentTemplate || !styleTemplate) return contentTemplate;

    try {
      // Extract the content between <body> tags from the content template
      const contentMatch = contentTemplate.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
      const styleMatch = styleTemplate.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
      
      if (!contentMatch) return contentTemplate;

      const content = contentMatch[1];
      const newStyle = styleMatch ? styleMatch[1] : '';

      // Create new template with preserved content and new styling
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            ${newStyle}
          </style>
        </head>
        <body>
          <div class="container">
            ${content}
          </div>
        </body>
        </html>
      `;
    } catch (error) {
      console.error('Error applying template style:', error);
      return contentTemplate;
    }
  };

  // Add this function to extract style from template
  const extractTemplateStyle = (template) => {
    if (!template) return '';
    const styleMatch = template.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
    return styleMatch ? styleMatch[1] : '';
  };

  // Modify templateLibrary to match OG template's leftmost alignment
  const templateLibrary = {
    'og': {
      name: 'OG Template (Navneet\'s Style)',
      template: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            ${currentTemplate ? extractTemplateStyle(currentTemplate) : `
              body { 
                font-family: Arial, sans-serif; 
                line-height: 1.6; 
                color: #2c3e50;
                margin: 0;
                padding: 0;
              }
              .container { 
                max-width: 600px; 
                margin: 0; 
                padding: 0;
                text-align: left;
              }
              p { margin-bottom: 1em; }
              .highlight { 
                color: #2c3e50; 
                font-weight: bold; 
              }
              a {
                display: inline-block;
                padding: 8px 16px;
                margin: 5px 10px 5px 0;
                background-color: #3498db;
                color: white !important;
                text-decoration: none;
                border-radius: 4px;
                font-weight: 500;
              }
              a:hover {
                background-color: #2980b9;
              }
            `}
          </style>
        </head>
        <body><div class="container"></div></body>
        </html>
      `
    },
    '1': {
      name: 'Corporate Blue',
      template: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { 
              font-family: 'Segoe UI', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              margin: 0;
              padding: 0;
              background: linear-gradient(135deg, #f5f7fa 0%, #e4e7eb 100%);
            }
            .container { 
              max-width: 600px;
              margin: 0;
              padding: 2em 2em 2em 0.5cm;
              text-align: left;
              background: white;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              border-radius: 8px;
            }
            p { 
              margin-bottom: 1.2em;
              padding: 0.8em;
              background: #f8fafc;
              border-radius: 4px;
            }
            .highlight { 
              color: #0066cc;
              font-weight: 600;
              border-bottom: 2px solid #0066cc;
            }
            a {
              display: inline-block;
              padding: 10px 20px;
              margin: 5px 10px 5px 0;
              background-color: #0066cc;
              color: white !important;
              text-decoration: none;
              border-radius: 4px;
              font-weight: 500;
              transition: all 0.3s ease;
              box-shadow: 0 2px 4px rgba(0,102,204,0.2);
            }
            a:hover {
              background-color: #0052a3;
              transform: translateY(-1px);
              box-shadow: 0 4px 6px rgba(0,102,204,0.3);
            }
          </style>
        </head>
        <body><div class="container"></div></body>
        </html>
      `
    },
    '2': {
      name: 'Modern Tech',
      template: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, sans-serif;
              line-height: 1.7;
              color: #2d3748;
              margin: 0;
              padding: 0;
            }
            .container { 
              max-width: 600px;
              margin: 0;
              padding: 0 0 0 0.5cm;
              text-align: left;
            }
            p { 
              margin-bottom: 1.2em;
              font-size: 15px;
            }
            .highlight { 
              color: #4a5568;
              font-weight: 600;
              background: linear-gradient(120deg, #ebf4ff 0%, #ebf4ff 100%);
              background-repeat: no-repeat;
              background-size: 100% 0.3em;
              background-position: 0 88%;
            }
            a {
              display: inline-block;
              padding: 10px 20px;
              margin: 5px 10px 5px 0;
              background-color: #4299e1;
              color: white !important;
              text-decoration: none;
              border-radius: 6px;
              font-weight: 500;
              box-shadow: 0 2px 4px rgba(66, 153, 225, 0.2);
              transition: all 0.2s ease;
            }
            a:hover {
              background-color: #3182ce;
              box-shadow: 0 4px 6px rgba(66, 153, 225, 0.3);
            }
          </style>
        </head>
        <body><div class="container"></div></body>
        </html>
      `
    },
    '3': {
      name: 'Executive Clean',
      template: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { 
              font-family: Georgia, serif;
              line-height: 1.7;
              color: #1a1a1a;
              margin: 0;
              padding: 0;
            }
            .container { 
              max-width: 600px;
              margin: 0;
              padding: 0 0 0 0.5cm;
              text-align: left;
            }
            p { 
              margin-bottom: 1.3em;
              font-size: 15px;
            }
            .highlight { 
              color: #1a1a1a;
              font-weight: bold;
              border-bottom: 1px solid #1a1a1a;
            }
            a {
              display: inline-block;
              padding: 8px 16px;
              margin: 5px 10px 5px 0;
              color: #1a1a1a !important;
              text-decoration: none;
              border: 1.5px solid #1a1a1a;
              border-radius: 0;
              font-family: 'Segoe UI', Arial, sans-serif;
              font-size: 14px;
              font-weight: 500;
              transition: all 0.3s ease;
            }
            a:hover {
              background-color: #1a1a1a;
              color: white !important;
            }
          </style>
        </head>
        <body><div class="container"></div></body>
        </html>
      `
    },
    '4': {
      name: 'Startup Bold',
      template: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { 
              font-family: 'SF Pro Display', -apple-system, sans-serif;
              line-height: 1.6;
              color: #111827;
              margin: 0;
              padding: 0;
            }
            .container { 
              max-width: 600px;
              margin: 0;
              padding: 0 0 0 0.5cm;
              text-align: left;
            }
            p { 
              margin-bottom: 1.2em;
              font-size: 15px;
            }
            .highlight { 
              color: #7C3AED;
              font-weight: 600;
            }
            a {
              display: inline-block;
              padding: 12px 24px;
              margin: 5px 10px 5px 0;
              background: linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%);
              color: white !important;
              text-decoration: none;
              border-radius: 8px;
              font-weight: 600;
              transition: all 0.3s ease;
              box-shadow: 0 4px 6px rgba(124, 58, 237, 0.2);
            }
            a:hover {
              transform: translateY(-2px);
              box-shadow: 0 6px 8px rgba(124, 58, 237, 0.3);
            }
          </style>
        </head>
        <body><div class="container"></div></body>
        </html>
      `
    },
    '5': {
      name: 'Fintech Professional',
      template: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { 
              font-family: Inter, -apple-system, sans-serif;
              line-height: 1.7;
              color: #1F2937;
              margin: 0;
              padding: 0;
            }
            .container { 
              max-width: 600px;
              margin: 0;
              padding: 0 0 0 0.5cm;
              text-align: left;
            }
            p { 
              margin-bottom: 1.2em;
              font-size: 15px;
            }
            .highlight { 
              color: #059669;
              font-weight: 600;
            }
            a {
              display: inline-block;
              padding: 10px 20px;
              margin: 5px 10px 5px 0;
              background-color: #059669;
              color: white !important;
              text-decoration: none;
              border-radius: 6px;
              font-weight: 500;
              transition: all 0.2s ease;
            }
            a:hover {
              background-color: #047857;
            }
          </style>
        </head>
        <body><div class="container"></div></body>
        </html>
      `
    },
    '6': {
      name: 'Enterprise Refined',
      template: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { 
              font-family: 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #374151;
              margin: 0;
              padding: 0;
            }
            .container { 
              max-width: 600px;
              margin: 0;
              padding: 0 0 0 0.5cm;
              text-align: left;
              border-left: 4px solid #3B82F6;
            }
            p { 
              margin-bottom: 1.2em;
              font-size: 15px;
            }
            .highlight { 
              color: #1E40AF;
              font-weight: 600;
            }
            a {
              display: inline-block;
              padding: 8px 16px;
              margin: 5px 10px 5px 0;
              background-color: #EFF6FF;
              color: #1E40AF !important;
              text-decoration: none;
              border: 1px solid #BFDBFE;
              border-radius: 4px;
              font-weight: 500;
              transition: all 0.2s ease;
            }
            a:hover {
              background-color: #DBEAFE;
              border-color: #93C5FD;
            }
          </style>
        </head>
        <body><div class="container"></div></body>
        </html>
      `
    },
    '7': {
      name: 'Modern Minimalist',
      template: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, sans-serif;
              line-height: 1.7;
              color: #18181B;
              margin: 0;
              padding: 0;
            }
            .container { 
              max-width: 600px;
              margin: 0;
              padding: 0 0 0 0.5cm;
              text-align: left;
            }
            p { 
              margin-bottom: 1.3em;
              font-size: 15px;
            }
            .highlight { 
              color: #18181B;
              font-weight: 600;
              border-bottom: 2px solid #D4D4D8;
            }
            a {
              display: inline-block;
              padding: 8px 20px;
              margin: 5px 10px 5px 0;
              background-color: #ffffff;
              color: #18181B !important;
              text-decoration: none;
              border: 1.5px solid #18181B;
              border-radius: 99px;
              font-weight: 500;
              transition: all 0.2s ease;
            }
            a:hover {
              background-color: #18181B;
              color: #ffffff !important;
            }
          </style>
        </head>
        <body><div class="container"></div></body>
        </html>
      `
    },
    '8': {
      name: 'Creative Timeline',
      template: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { 
              font-family: 'Nunito', sans-serif;
              line-height: 1.7;
              color: #2d3436;
              margin: 0;
              padding: 0;
              background: #f7f7f7;
            }
            .container { 
              max-width: 600px;
              margin: 0;
              padding: 2em 2em 2em 0.5cm;
              text-align: left;
              position: relative;
            }
            p { 
              margin-bottom: 2em;
              font-size: 15px;
              position: relative;
              padding-left: 30px;
              background: white;
              padding: 1.2em;
              border-radius: 10px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.05);
            }
            p::before {
              content: '⏱';
              position: absolute;
              left: -25px;
              top: 50%;
              transform: translateY(-50%);
              width: 30px;
              height: 30px;
              background: #fdcb6e;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 16px;
              color: white;
              box-shadow: 0 2px 4px rgba(253,203,110,0.3);
            }
            p:nth-child(2)::before { content: '📍'; background: #ff7675; }
            p:nth-child(3)::before { content: '💡'; background: #74b9ff; }
            p:nth-child(4)::before { content: '🎯'; background: #55efc4; }
            p:nth-child(5)::before { content: '🚀'; background: #a29bfe; }
            .highlight { 
              color: #2d3436;
              font-weight: 600;
              background: linear-gradient(120deg, #fdcb6e 0%, #fdcb6e 100%);
              background-repeat: no-repeat;
              background-size: 100% 0.2em;
              background-position: 0 88%;
              padding: 0.1em 0;
            }
            a {
              display: inline-block;
              padding: 10px 20px;
              margin: 5px 10px 5px 0;
              background: white;
              color: #2d3436 !important;
              text-decoration: none;
              border-radius: 25px;
              font-weight: 500;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              transition: all 0.3s ease;
              border: 2px solid #fdcb6e;
              position: relative;
              overflow: hidden;
            }
            a:hover {
              background: #fdcb6e;
              transform: translateY(-2px);
              box-shadow: 0 4px 8px rgba(253,203,110,0.3);
            }
          </style>
        </head>
        <body><div class="container"></div></body>
        </html>
      `
    },
    '9': {
      name: 'Neon Cyberpunk',
      template: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, sans-serif;
              line-height: 1.7;
              color: #E4F0FB;
              margin: 0;
              padding: 0;
              background: #0A192F;
            }
            .container { 
              max-width: 600px;
              margin: 0;
              padding: 2em 2em 2em 0.5cm;
              text-align: left;
            }
            p { 
              margin-bottom: 1.5em;
              font-size: 15px;
              background: rgba(16, 32, 64, 0.8);
              padding: 1.2em 1.5em;
              border-left: 3px solid #64FFDA;
              position: relative;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            p::before {
              content: '>';
              position: absolute;
              left: -25px;
              color: #64FFDA;
              font-family: monospace;
              font-weight: bold;
              font-size: 16px;
            }
            .highlight { 
              color: #64FFDA;
              font-weight: 500;
              padding: 0.1em 0.3em;
              background: rgba(100, 255, 218, 0.1);
              border-radius: 3px;
            }
            a {
              display: inline-block;
              padding: 10px 20px;
              margin: 5px 10px 5px 0;
              background: transparent;
              color: #64FFDA !important;
              text-decoration: none;
              border: 1px solid #64FFDA;
              border-radius: 4px;
              font-weight: 500;
              transition: all 0.2s ease;
            }
            a:hover {
              background: rgba(100, 255, 218, 0.1);
              transform: translateY(-1px);
              box-shadow: 0 2px 4px rgba(100, 255, 218, 0.2);
            }
          </style>
        </head>
        <body><div class="container"></div></body>
        </html>
      `
    },
    '11': {
      name: 'Luxury Gold',
      template: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, sans-serif;
              line-height: 1.7;
              color: #2C3E50;
              margin: 0;
              padding: 0;
              background: #FFFFFF;
            }
            .container { 
              max-width: 600px;
              margin: 0;
              padding: 2em 2em 2em 0.5cm;
              text-align: left;
              position: relative;
            }
            .container::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              height: 2px;
              background: linear-gradient(90deg, #B8860B, #FFD700, #B8860B);
            }
            p { 
              margin-bottom: 1.5em;
              font-size: 15px;
              padding: 1.2em 1.5em;
              background: #FFFFFF;
              border: 1px solid #DEB887;
              border-left: 3px solid #B8860B;
              position: relative;
              box-shadow: 0 2px 4px rgba(184, 134, 11, 0.1);
            }
            p::before {
              content: '•';
              position: absolute;
              left: -25px;
              color: #B8860B;
              font-size: 20px;
              line-height: 1;
            }
            .highlight { 
              color: #8B4513;
              font-weight: 600;
              padding: 0.1em 0.3em;
              background: rgba(222, 184, 135, 0.2);
              border-radius: 3px;
            }
            a {
              display: inline-block;
              padding: 10px 20px;
              margin: 5px 10px 5px 0;
              background: #FFFFFF;
              color: #8B4513 !important;
              text-decoration: none;
              border: 1px solid #B8860B;
              border-radius: 4px;
              font-weight: 500;
              transition: all 0.2s ease;
            }
            a:hover {
              background: rgba(184, 134, 11, 0.1);
              border-color: #8B4513;
            }
          </style>
        </head>
        <body><div class="container"></div></body>
        </html>
      `
    },
    '12': {
      name: 'Nature Zen',
      template: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, sans-serif;
              line-height: 1.7;
              color: #2F4F4F;
              margin: 0;
              padding: 0;
              background: #F5F8F5;
            }
            .container { 
              max-width: 600px;
              margin: 0;
              padding: 2em 2em 2em 0.5cm;
              text-align: left;
            }
            p { 
              margin-bottom: 1.5em;
              font-size: 15px;
              padding: 1.2em 1.5em;
              background: #FFFFFF;
              border-radius: 8px;
              border-left: 3px solid #4F7942;
              position: relative;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
            }
            p::before {
              content: '•';
              position: absolute;
              left: -25px;
              color: #4F7942;
              font-size: 24px;
              line-height: 1;
            }
            p:nth-child(2) { border-color: #558564; }
            p:nth-child(3) { border-color: #5F9EA0; }
            p:nth-child(4) { border-color: #6B8E23; }
            p:nth-child(5) { border-color: #8FBC8F; }
            .highlight { 
              color: #2E8B57;
              font-weight: 600;
              padding: 0.1em 0.3em;
              background: rgba(79, 121, 66, 0.1);
              border-radius: 3px;
            }
            a {
              display: inline-block;
              padding: 10px 20px;
              margin: 5px 10px 5px 0;
              background: #FFFFFF;
              color: #2E8B57 !important;
              text-decoration: none;
              border: 1px solid #4F7942;
              border-radius: 4px;
              font-weight: 500;
              transition: all 0.2s ease;
            }
            a:hover {
              background: rgba(79, 121, 66, 0.1);
              transform: translateY(-1px);
              box-shadow: 0 2px 4px rgba(79, 121, 66, 0.2);
            }
          </style>
        </head>
        <body><div class="container"></div></body>
        </html>
      `
    }
  };

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

    try {
      const apiUrl = process.env.NODE_ENV === 'production' 
        ? 'https://email-backend-tf0l.onrender.com' 
        : 'http://localhost:5001';

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

      // Set up SSE connection for progress updates BEFORE sending request
      const eventSource = new EventSource(`${apiUrl}/api/send-emails-sse?email=${emailCredentials.email}`);
      
      // Add initial log message
      setEmailProgress(prev => ({
        ...prev,
        logs: [...prev.logs, `Starting email sending process for ${validEntries.length} recipients`]
      }));

      if (tabValue === 0 && file) {
        const formData = new FormData();
        Object.entries(requestData).forEach(([key, value]) => {
          formData.append(key, value);
        });
        formData.append('file', file);
        
        const response = await axios.post(`${apiUrl}/api/send-emails`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        
        if (response.data.success) {
          setStatusMessage({ 
            type: 'success', 
            message: 'Started sending emails from CSV file' 
          });
          setOpenSnackbar(true);
        }
      } else {
        // For manual entries, send as JSON
        const response = await axios.post(`${apiUrl}/api/send-emails`, requestData, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (response.data.success) {
          setStatusMessage({ 
            type: 'success', 
            message: 'Started sending manual emails' 
          });
          setOpenSnackbar(true);
        }
      }
      
      eventSource.onmessage = (event) => {
        try {
        const data = JSON.parse(event.data);
          console.log('SSE Event:', data); // For debugging

          // Extract numbers from the message if it's a log
          if (data.type === 'log') {
            const message = data.message;
            // Check for the specific success message format
            const successMatch = message.match(/(\d+)\/(\d+): Successfully sent email to/);
            if (successMatch) {
              const current = parseInt(successMatch[1]);
              console.log('Success match:', current); // Debug log
          setEmailProgress(prev => ({
            ...prev,
                current: current,
                success: current,
                logs: [...prev.logs, message]
              }));
            } else if (message.includes('failed')) {
              // Extract failed count from message if possible
              const failedMatch = message.match(/(\d+)\/(\d+):/);
              const current = failedMatch ? parseInt(failedMatch[1]) : (prev => prev.current + 1);
          setEmailProgress(prev => ({
            ...prev,
                current: typeof current === 'number' ? current : prev.current + 1,
                failed: prev.failed + 1,
                logs: [...prev.logs, message]
              }));
            } else {
              // Just add the log
              setEmailProgress(prev => ({
                ...prev,
                logs: [...prev.logs, message]
              }));
            }
            
            // Debug log the current state
            console.log('Current progress state:', {
              message,
              type: data.type,
              isSuccess: message.includes('Successfully sent email to')
            });
          }
          // Handle explicit progress updates
          else if (data.type === 'progress' && data.current !== undefined) {
            const newCurrent = parseInt(data.current);
            const newSuccess = parseInt(data.success || 0);
            const newFailed = parseInt(data.failed || 0);
            
            console.log('Progress update:', { newCurrent, newSuccess, newFailed }); // Debug log
            
            setEmailProgress(prev => {
              const updatedProgress = {
                ...prev,
                current: Math.max(prev.current, newCurrent),
                success: Math.max(prev.success, newSuccess),
                failed: Math.max(prev.failed, newFailed)
              };
              console.log('Updated progress:', updatedProgress); // Debug log
              return updatedProgress;
            });
        } else if (data.type === 'complete') {
          eventSource.close();
          setIsLoading(false);
            setStatusMessage({ 
              type: 'success', 
              message: `Completed sending emails. Success: ${data.success}, Failed: ${data.failed}` 
            });
          setOpenSnackbar(true);
          }
        } catch (error) {
          console.error('Error processing SSE message:', error);
        }
      };

      eventSource.onopen = () => {
        console.log('SSE Connection opened');
      };

      eventSource.onerror = (error) => {
        console.error('SSE Error:', error);
        eventSource.close();
        setIsLoading(false);
        setStatusMessage({ type: 'error', message: 'Error during email sending process' });
        setOpenSnackbar(true);
      };
      
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

  // Add these new functions after other functions
  const fetchTemplate = async (userType) => {
    setIsTemplateLoading(true);
    try {
      const apiUrl = process.env.NODE_ENV === 'production' 
        ? 'https://email-backend-tf0l.onrender.com' 
        : 'http://localhost:5001';

      console.log('Fetching template for:', userType);
      const response = await axios.get(`${apiUrl}/api/get-template/${userType}`);
      console.log('Template response:', response.data);
      
      if (response.data.success) {
        const template = response.data.template;
        console.log('Setting template:', template);
        setCurrentTemplate(template);
      } else {
        console.log('No template in response');
        setCurrentTemplate('');
      }
    } catch (error) {
      console.error('Error fetching template:', error);
      setStatusMessage({ 
        type: 'error', 
        message: error.response?.data?.message || error.message || 'Error fetching template' 
      });
      setOpenSnackbar(true);
      setCurrentTemplate('');
    } finally {
      setIsTemplateLoading(false);
    }
  };

  const handleTemplateUpdate = async () => {
    if (!selectedUser || !newTemplate) {
      setStatusMessage({ type: 'error', message: 'Please select a user and enter a template' });
      setOpenSnackbar(true);
      return;
    }

    try {
      const apiUrl = process.env.NODE_ENV === 'production' 
        ? 'https://email-backend-tf0l.onrender.com' 
        : 'http://localhost:5001';

      const response = await axios.post(`${apiUrl}/api/update-template`, {
        userType: selectedUser,
        template: newTemplate
      });

      if (response.data.success) {
        setCurrentTemplate(newTemplate);
        setNewTemplate(''); // Clear the input field after successful update
        setStatusMessage({ 
          type: 'success', 
          message: 'Template updated successfully' 
        });
      } else {
        throw new Error(response.data.message || 'Failed to update template');
      }
    } catch (error) {
      setStatusMessage({ 
        type: 'error', 
        message: error.response?.data?.message || error.message || 'Error updating template' 
      });
    }
    setOpenSnackbar(true);
  };

  const handleTemplateBrocodeSubmit = () => {
    if (templateBrocode === 'nottandav') {
      setIsTemplateTabUnlocked(true);
      setTemplateBrocodeError(false);
      setSelectedUser('navneet');
      fetchTemplate('navneet');
    } else {
      setTemplateBrocodeError(true);
      setIsTemplateTabUnlocked(false);
    }
  };

  // Add this helper function after other helper functions
  const getPreviewTemplate = (template) => {
    if (!template) return '';
    
    // Sample data for preview
    const sampleData = {
      firstName: 'John',
      Name: 'John Smith',
      Company: 'Example Corp',
      Email: 'john@example.com',
      Role: 'Software Engineer',
      Link: 'https://example.com/job'
    };

    // Replace regular template variables
    let previewTemplate = template
      .replace(/\$\{firstName\}/g, sampleData.firstName)
      .replace(/\$\{Name\}/g, sampleData.Name)
      .replace(/\$\{Company\}/g, sampleData.Company)
      .replace(/\$\{Email\}/g, sampleData.Email)
      .replace(/\$\{Role\}/g, sampleData.Role);

    // Handle conditional Link statement
    const linkRegex = /\$\{Link \? `(.*?)` : ''\}/g;
    previewTemplate = previewTemplate.replace(linkRegex, (match, content) => {
      return content.replace(/\$\{Link\}/g, sampleData.Link);
    });

    // Replace any remaining ${Link} variables
    previewTemplate = previewTemplate.replace(/\$\{Link\}/g, sampleData.Link);

    return previewTemplate;
  };

  // Modify handleTemplateSelect to preserve content
  const handleTemplateSelect = (templateId) => {
    setSelectedTemplateId(templateId);
    const newTemplate = applyTemplateStyle(currentTemplate, templateLibrary[templateId].template);
    setPreviewTemplate(newTemplate);
  };

  // Modify handleSetAsMyTemplate to use the styled template
  const handleSetAsMyTemplate = async () => {
    if (!selectedUser || !previewTemplate) {
      setStatusMessage({ type: 'error', message: 'Please select a user and template' });
      setOpenSnackbar(true);
      return;
    }

    try {
      const apiUrl = process.env.NODE_ENV === 'production' 
        ? 'https://email-backend-tf0l.onrender.com' 
        : 'http://localhost:5001';

      const response = await axios.post(`${apiUrl}/api/update-template`, {
        userType: selectedUser,
        template: previewTemplate
      });

      if (response.data.success) {
        setCurrentTemplate(previewTemplate);
        setStatusMessage({ 
          type: 'success', 
          message: 'Template styling updated successfully' 
        });
      } else {
        throw new Error(response.data.message || 'Failed to update template');
      }
    } catch (error) {
      setStatusMessage({ 
        type: 'error', 
        message: error.response?.data?.message || error.message || 'Error updating template' 
      });
    }
    setOpenSnackbar(true);
  };

  // Add this function to fetch follow-up template
  const fetchFollowUpTemplate = async (userType) => {
    setIsFollowUpTemplateLoading(true);
    try {
      const apiUrl = process.env.NODE_ENV === 'production' 
        ? 'https://email-backend-tf0l.onrender.com' 
        : 'http://localhost:5001';

      const response = await axios.get(`${apiUrl}/api/followup-template/${userType}`);
      
      if (response.data.success) {
        setFollowUpTemplate(response.data.template || '');
      }
    } catch (error) {
      console.error('Error fetching follow-up template:', error);
      setStatusMessage({ 
        type: 'error', 
        message: 'Failed to fetch follow-up template' 
      });
      setOpenSnackbar(true);
    } finally {
      setIsFollowUpTemplateLoading(false);
    }
  };

  // Add this function to save follow-up template
  const handleSaveFollowUpTemplate = async () => {
    try {
      const apiUrl = process.env.NODE_ENV === 'production' 
        ? 'https://email-backend-tf0l.onrender.com' 
        : 'http://localhost:5001';

      const response = await axios.post(`${apiUrl}/api/followup-template`, {
        userProfile: selectedUser,
        template: followUpTemplate
      });
      
      if (response.data.success) {
        setStatusMessage({ 
          type: 'success', 
          message: 'Follow-up template saved successfully' 
        });
        setOpenSnackbar(true);
      }
    } catch (error) {
      setStatusMessage({ 
        type: 'error', 
        message: error.response?.data?.message || 'Error saving follow-up template' 
      });
      setOpenSnackbar(true);
    }
  };

  // Add this effect to fetch template when user changes
  useEffect(() => {
    if (selectedUser) {
      fetchFollowUpTemplate(selectedUser);
    }
  }, [selectedUser]);

  // Add this effect to sync resume link in template
  useEffect(() => {
    if (followUpTemplate && currentResumeLink) {
      const updatedTemplate = followUpTemplate.replace(
        /https:\/\/drive\.google\.com\/[^\s"')]+/g,
        currentResumeLink
      );
      if (updatedTemplate !== followUpTemplate) {
        setFollowUpTemplate(updatedTemplate);
      }
    }
  }, [currentResumeLink]);

  // Add this handler function with other handlers
  const handleBulkReplyMark = async () => {
    try {
      const apiUrl = process.env.NODE_ENV === 'production' 
        ? 'https://email-backend-tf0l.onrender.com' 
        : 'http://localhost:5001';

      const response = await axios.post(`${apiUrl}/api/bulk-mark-reply`, {
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
          <Tab label="Resume Management" />
          <Tab label="Template Management" />
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
                    // Remove duplicate "Starting email sending process" messages
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
                          height: { xs: '500px', sm: '600px', md: '800px' },
                          overflow: 'hidden',
                          borderRadius: 2,
                          bgcolor: '#f5f5f5',
                          mb: { xs: 4, sm: 2 },
                          '& iframe': {
                            width: '100%',
                            height: '100%',
                            border: 'none',
                            transform: 'scale(1.05)',  // Slightly scale up to remove borders
                            transformOrigin: 'center',
                            display: 'block'  // Remove any inline spacing
                          }
                        }}
                      >
                        <Box sx={{
                          width: '100%',
                          height: '100%',
                          overflow: 'hidden',
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center'
                        }}>
                          <iframe
                            src={convertGoogleDriveUrl(currentResumeLink)}
                            title="Resume Preview"
                            loading="lazy"
                          />
                        </Box>
                      </Paper>
                    </Box>
                  )}
                </Box>
              </Box>
            )}
          </Box>
        )}

        {/* Template Management Tab */}
        {tabIndex === 2 && (
          <Box sx={{ mt: 3 }}>
            {!isTemplateTabUnlocked ? (
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
                  🔒 Enter Brocode to Access Template Management
                </Typography>
                <TextField
                  fullWidth
                  type="password"
                  label="Brocode"
                  value={templateBrocode}
                  onChange={(e) => setTemplateBrocode(e.target.value)}
                  error={templateBrocodeError}
                  helperText={templateBrocodeError ? "Incorrect brocode" : ""}
                  sx={{ mb: 2 }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleTemplateBrocodeSubmit();
                    }
                  }}
                />
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleTemplateBrocodeSubmit}
                  sx={{ 
                    py: 1.5,
                    bgcolor: 'primary.main',
                    '&:hover': {
                      bgcolor: 'primary.dark',
                    }
                  }}
                >
                  Unlock Template Management
                </Button>
              </Box>
            ) : (
              <Box>
                <Typography variant="h6" component="h2" sx={{ mb: 3 }}>
                  Template Management
                </Typography>
                
                <Box sx={{ mb: 4 }}>
                  <FormControl fullWidth sx={{ mb: 3 }}>
                    <InputLabel id="template-profile-select-label">Select Profile</InputLabel>
                    <Select
                      labelId="template-profile-select-label"
                      id="template-profile-select"
                      value={selectedUser}
                      label="Select Profile"
                      onChange={(e) => {
                        handleUserChange(e);
                        fetchTemplate(e.target.value);
                      }}
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
                  
                  {/* Template Tabs */}
                  <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                    <Tabs value={templateTabIndex} onChange={handleTemplateTabChange}>
                      <Tab label="Email Template" />
                      <Tab label="Follow-up Template" />
                    </Tabs>
                  </Box>

                  {/* Current Template Tab */}
                  {templateTabIndex === 0 && (
                    <Box>
                      <Typography variant="h6" component="h3" sx={{ mb: 2 }}>
                        Current Template
                      </Typography>
                      
                      {/* Current Template Display */}
                      <Box sx={{ 
                        p: 2, 
                        bgcolor: '#f5f5f5', 
                        borderRadius: 1,
                        border: '1px solid #e0e0e0',
                        mb: 3
                      }}>
                        <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                          HTML Template
                        </Typography>
                        {isTemplateLoading ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CircularProgress size={20} />
                            <Typography variant="body2">Loading...</Typography>
                          </Box>
                        ) : currentTemplate ? (
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              wordBreak: 'break-all',
                              fontFamily: 'monospace',
                              bgcolor: '#ffffff',
                              p: 1,
                              borderRadius: 0.5,
                maxHeight: '200px', 
                              overflow: 'auto'
              }}
            >
                            {currentTemplate}
                </Typography>
                        ) : (
                          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                            No template set
                          </Typography>
                        )}
                      </Box>

                      {/* Manual Template Update */}
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle1" gutterBottom>
                          Update Template Manually
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <TextField
                            fullWidth
                            multiline
                            rows={6}
                            label="New Template"
                            value={newTemplate}
                            onChange={(e) => setNewTemplate(e.target.value)}
                            variant="outlined"
                            placeholder="Enter new HTML template..."
                            helperText="Enter new template to update"
                          />
                          <Button
                            variant="contained"
                            onClick={handleTemplateUpdate}
                            sx={{ height: 'auto' }}
                            disabled={isTemplateLoading}
                          >
                            Update
                          </Button>
                        </Box>
                      </Box>

                      {/* Current Template Preview */}
                      {currentTemplate && (
                        <Box sx={{ mt: 4 }}>
                          <Typography variant="h6" component="h3" sx={{ mb: 2 }}>
                            Current Template Preview
                          </Typography>
                          <Paper 
                            elevation={3} 
                            sx={{ 
                              width: '100%',
                              minHeight: { xs: '300px', sm: '400px', md: '500px' },
                              overflow: 'hidden',
                              borderRadius: 2,
                              bgcolor: '#ffffff',
                              mb: { xs: 4, sm: 2 },
                              p: 3
                            }}
                          >
                            <div dangerouslySetInnerHTML={{ 
                              __html: getPreviewTemplate(currentTemplate) 
                            }} />
            </Paper>
          </Box>
        )}
          </Box>
        )}

                  {/* Follow-up Template Tab */}
                  {templateTabIndex === 1 && (
                    <Box>
                      <Typography variant="h6" component="h3" sx={{ mb: 2 }}>
                        Follow-up Template
                      </Typography>
                      
                      <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel>Select User Profile</InputLabel>
                        <Select
                          value={selectedUser}
                          onChange={handleUserChange}
                          label="Select User Profile"
                        >
                          <MenuItem value="navneet">Navneet</MenuItem>
                          <MenuItem value="teghdeep">Teghdeep</MenuItem>
                          <MenuItem value="divyam">Divyam</MenuItem>
                          <MenuItem value="dhananjay">Dhananjay</MenuItem>
                          <MenuItem value="akash">Akash</MenuItem>
                          <MenuItem value="avi">Avi</MenuItem>
                          <MenuItem value="komal">Komal</MenuItem>
                          <MenuItem value="pooja">Pooja</MenuItem>
                        </Select>
                      </FormControl>

                      <TextField
                        fullWidth
                        multiline
                        rows={10}
                        label="Follow-up Template"
                        value={followUpTemplate}
                        onChange={(e) => setFollowUpTemplate(e.target.value)}
                        sx={{ mb: 2 }}
                      />

                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle1" gutterBottom>
                          Template Preview
                        </Typography>
                        <Paper 
                          variant="outlined" 
                          sx={{ 
                            p: 2,
                            minHeight: '200px',
                            maxHeight: '400px',
                            overflow: 'auto',
                            bgcolor: '#f5f5f5'
                          }}
                        >
                          <div dangerouslySetInnerHTML={{ __html: followUpTemplate }} />
                        </Paper>
                      </Box>

                      <Button
                        variant="contained"
                        onClick={handleSaveFollowUpTemplate}
                        disabled={isFollowUpTemplateLoading}
                      >
                        {isFollowUpTemplateLoading ? (
                          <CircularProgress size={24} />
                        ) : (
                          'Save Follow-up Template'
                        )}
                      </Button>
                    </Box>
                  )}
                </Box>
              </Box>
            )}
          </Box>
        )}

        {/* Move All Records tab to index 3 */}
        {tabIndex === 3 && (
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
      {tabIndex === 3 && isAuditUnlocked && (
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

      {/* Follow-up Dialog */}
      <Dialog 
        open={showFollowUpDialog} 
        onClose={() => {
          setShowFollowUpDialog(false);
          setSelectedRecord(null);
          setFollowUpEmailCredentials({ email: '', password: '' });
          setShowAppPasswordHelp(false);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Send Follow-up Email</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Send a follow-up email to {selectedRecord?.name} at {selectedRecord?.company}
          </Typography>
          <TextField
            fullWidth
            label="Email"
            type="email"
            name="email"
            value={followUpEmailCredentials.email}
            onChange={(e) => setFollowUpEmailCredentials(prev => ({
              ...prev,
              email: e.target.value
            }))}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="App Password"
            type="password"
            name="password"
            value={followUpEmailCredentials.password}
            onChange={(e) => setFollowUpEmailCredentials(prev => ({
              ...prev,
              password: e.target.value
            }))}
            helperText={
              showAppPasswordHelp ? 
                "Please use an App Password from Google Account settings. Regular password won't work." : 
                "Use App Password from Google Account"
            }
            error={showAppPasswordHelp}
            sx={{ mb: 2 }}
          />
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
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setShowFollowUpDialog(false);
            setSelectedRecord(null);
            setFollowUpEmailCredentials({ email: '', password: '' });
            setShowAppPasswordHelp(false);
          }}>
            Cancel
          </Button>
          <Button 
            onClick={() => handleSendFollowUp(selectedRecord)}
            variant="contained"
          >
            Send Follow-up
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Bulk Follow-up Button - Only show in All Records tab */}
      {isAuditUnlocked && tabIndex === 3 && (
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => setShowBulkFollowUpDialog(true)}
            startIcon={<ReplyIcon />}
          >
            Bulk Follow-up
          </Button>
    </Box>
      )}

      {/* Bulk Follow-up Dialog */}
      <Dialog 
        open={showBulkFollowUpDialog} 
        onClose={() => {
          setShowBulkFollowUpDialog(false);
          setFollowUpEmailCredentials({ email: '', password: '' });
          setFollowUpDateRange({ startDate: '', endDate: '' });
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
              value={selectedUser}
              onChange={handleUserChange}
              label="Select User Profile"
            >
              <MenuItem value="navneet">Navneet</MenuItem>
              <MenuItem value="teghdeep">Teghdeep</MenuItem>
              <MenuItem value="divyam">Divyam</MenuItem>
              <MenuItem value="dhananjay">Dhananjay</MenuItem>
              <MenuItem value="akash">Akash</MenuItem>
              <MenuItem value="avi">Avi</MenuItem>
              <MenuItem value="komal">Komal</MenuItem>
              <MenuItem value="pooja">Pooja</MenuItem>
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Email"
            type="email"
            name="email"
            value={followUpEmailCredentials.email}
            onChange={(e) => setFollowUpEmailCredentials(prev => ({
              ...prev,
              email: e.target.value
            }))}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="App Password"
            type="password"
            name="password"
            value={followUpEmailCredentials.password}
            onChange={(e) => setFollowUpEmailCredentials(prev => ({
              ...prev,
              password: e.target.value
            }))}
            helperText="Use App Password from Google Account"
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Start Date"
            type="date"
            value={followUpDateRange.startDate}
            onChange={(e) => setFollowUpDateRange(prev => ({
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
            value={followUpDateRange.endDate}
            onChange={(e) => setFollowUpDateRange(prev => ({
              ...prev,
              endDate: e.target.value
            }))}
            InputLabelProps={{ shrink: true }}
          />
          {isLoading && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body1" color="primary" align="center" sx={{ mb: 2 }}>
                Email sending in progress...
              </Typography>
              <LinearProgress variant="determinate" value={(emailProgress.current / emailProgress.total) * 100} />
              <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
                {emailProgress.current}/{emailProgress.total} emails sent
                ({emailProgress.success} success, {emailProgress.failed} failed)
              </Typography>
              <Box sx={{ mt: 1, maxHeight: 100, overflowY: 'auto' }}>
                {emailProgress.logs.map((log, index) => (
                  <Typography key={index} variant="caption" display="block" color="text.secondary">
                    {log}
                  </Typography>
                ))}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setShowBulkFollowUpDialog(false);
            setFollowUpEmailCredentials({ email: '', password: '' });
            setFollowUpDateRange({ startDate: '', endDate: '' });
          }}>
            Cancel
          </Button>
          <Button 
            onClick={handleSendBulkFollowUp}
            variant="contained"
            disabled={isLoading}
          >
            {isLoading ? 'Sending...' : 'Send Bulk Follow-ups'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Manual Email Dialog */}
      <Dialog
        open={showManualDialog}
        onClose={() => setShowManualDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Send Manual Emails</DialogTitle>
        <DialogContent>
          {/* ... existing form fields ... */}
          {isLoading && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body1" color="primary" align="center" sx={{ mb: 2 }}>
                Email sending in progress...
              </Typography>
              <LinearProgress variant="determinate" value={(emailProgress.current / emailProgress.total) * 100} />
              <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
                {emailProgress.current}/{emailProgress.total} emails sent
                ({emailProgress.success} success, {emailProgress.failed} failed)
              </Typography>
              <Box sx={{ mt: 1, maxHeight: 100, overflowY: 'auto' }}>
                {emailProgress.logs.map((log, index) => (
                  <Typography key={index} variant="caption" display="block" color="text.secondary">
                    {log}
                  </Typography>
                ))}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowManualDialog(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSendEmails}
            variant="contained"
            disabled={isLoading}
          >
            {isLoading ? 'Sending...' : 'Send Emails'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Reply Mark Dialog */}
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
              <MenuItem value="all">All Users</MenuItem>
              <MenuItem value="navneet">Navneet</MenuItem>
              <MenuItem value="teghdeep">Teghdeep</MenuItem>
              <MenuItem value="divyam">Divyam</MenuItem>
              <MenuItem value="dhananjay">Dhananjay</MenuItem>
              <MenuItem value="akash">Akash</MenuItem>
              <MenuItem value="avi">Avi</MenuItem>
              <MenuItem value="komal">Komal</MenuItem>
              <MenuItem value="pooja">Pooja</MenuItem>
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
          />
          {isLoading && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body1" color="primary" align="center" sx={{ mb: 2 }}>
                Email sending in progress...
              </Typography>
              <LinearProgress variant="determinate" value={(emailProgress.current / emailProgress.total) * 100} />
              <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
                {emailProgress.current}/{emailProgress.total} emails sent
                ({emailProgress.success} success, {emailProgress.failed} failed)
              </Typography>
              <Box sx={{ mt: 1, maxHeight: 100, overflowY: 'auto' }}>
                {emailProgress.logs.map((log, index) => (
                  <Typography key={index} variant="caption" display="block" color="text.secondary">
                    {log}
                  </Typography>
                ))}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowBulkReplyDialog(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleBulkReplyMark}
            variant="contained"
            disabled={isLoading}
          >
            {isLoading ? 'Marking...' : 'Mark Replies'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default App;