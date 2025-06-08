import React, { useState, useEffect } from 'react';
import axios from 'axios';
import axiosInstance from '../utils/axios';
import {
  Box,
  Typography,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  Paper,
  Tabs,
  Tab,
  CircularProgress
} from '@mui/material';

const TemplateManagement = () => {
  // States
  const [currentTemplate, setCurrentTemplate] = useState('');
  const [newTemplate, setNewTemplate] = useState('');
  const [isTemplateLoading, setIsTemplateLoading] = useState(false);
  const [isTemplateTabUnlocked, setIsTemplateTabUnlocked] = useState(false);
  const [templateBrocode, setTemplateBrocode] = useState('');
  const [templateBrocodeError, setTemplateBrocodeError] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState('1');
  const [previewTemplate, setPreviewTemplate] = useState('');
  const [templateTabIndex, setTemplateTabIndex] = useState(0);
  const [selectedUser, setSelectedUser] = useState('');
  const [statusMessage, setStatusMessage] = useState({ type: '', message: '' });
  const [openSnackbar, setOpenSnackbar] = useState(false);
    // Add these new states after other state declarations
    const [followUpTemplate, setFollowUpTemplate] = useState('');
    const [isFollowUpTemplateLoading, setIsFollowUpTemplateLoading] = useState(false);
    // User selection
      const [userProfile, setUserProfile] = useState(null);
      const [isProfileLoading, setIsProfileLoading] = useState(false);

  const nameOptions = [
    { value: 'navneet', label: 'Navneet' },
    { value: 'teghdeep', label: 'Teghdeep' },
    { value: 'divyam', label: 'Divyam' },
    { value: 'dhananjay', label: 'Dhananjay' },
    { value: 'akash', label: 'Akash' },
    { value: 'avi', label: 'Avi' },
    { value: 'komal', label: 'Komal' },
    { value: 'pooja', label: 'Pooja' }
  ];

  // Add this function to save follow-up template
    const handleSaveFollowUpTemplate = async () => {
      try {
        const response = await axiosInstance.post('/api/followup-template', {
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

     const fetchUserProfile = async () => {
      setIsProfileLoading(true);
      try {
        const response = await axiosInstance.get('/api/user-profiles');
        console.log('Response of user profile:', response);
        
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


    
  // Add handler for template tab change
  const handleTemplateTabChange = (event, newValue) => {
    setTemplateTabIndex(newValue);
  };


   // Add this helper function to extract content and apply new styling
  const applyTemplateStyle = (contentTemplate, styleTemplate) => {
  };

  // Add this function to extract style from template
  const extractTemplateStyle = (template) => {
    if (!template) return '';
    const styleMatch = template.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
    return styleMatch ? styleMatch[1] : '';
  };


          const fetchBasicInformation = async () => {
            fetchUserProfile();
          };
      
       // Fetch profile on component mount
       useEffect(() => {
        fetchBasicInformation();
      }, []); // Empty dependency array means this runs once on mount


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

    // Add these helper functions at the top of the file, after the imports
  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };


  // Fetch template
  const fetchTemplate = async (userType) => {
    setIsTemplateLoading(true);
    try {
      const response = await axiosInstance.get(`/api/get-template/${userType}`);
      
      if (response.data.success) {
        setCurrentTemplate(response.data.template);
      } else {
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

  // Handle template update
  const handleTemplateUpdate = async () => {
    if (!selectedUser || !newTemplate) {
      setStatusMessage({ type: 'error', message: 'Please select a user and enter a template' });
      setOpenSnackbar(true);
      return;
    }

    try {
      const response = await axiosInstance.post('/api/update-template', {
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

  // Handle brocode submit
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

  // Get preview template
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

  // Handle template select
  const handleTemplateSelect = (templateId) => {
    setSelectedTemplateId(templateId);
    const newTemplate = applyTemplateStyle(currentTemplate, templateLibrary[templateId].template);
    setPreviewTemplate(newTemplate);
  };

  // Handle set as my template
  const handleSetAsMyTemplate = async () => {
    if (!selectedUser || !previewTemplate) {
      setStatusMessage({ type: 'error', message: 'Please select a user and template' });
      setOpenSnackbar(true);
      return;
    }

    try {
      const response = await axiosInstance.post('/api/update-template', {
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

  // Handle user change
  const handleUserChange = (e) => {
    const userType = e.target.value;
    setSelectedUser(userType);
    fetchTemplate(userType);
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTemplateTabIndex(newValue);
  };

  return (
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
  );
};

export default TemplateManagement;