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
import PersonIcon from '@mui/icons-material/Person';
import axiosInstance from '../utils/axios';

const ResumeManagement = () => {
    const [isResumeTabUnlocked, setIsResumeTabUnlocked] = useState(false);
    const [resumeBrocode, setResumeBrocode] = useState('');
    const [resumeBrocodeError, setResumeBrocodeError] = useState(false);
          const [currentResumeLink, setCurrentResumeLink] = useState('');
      const [newResumeLink, setNewResumeLink] = useState('');
        const [isResumeLinkLoading, setIsResumeLinkLoading] = useState(false);
          const [userProfile, setUserProfile] = useState(null);
            const [selectedUser, setSelectedUser] = useState('navneet');
            const [openSnackbar, setOpenSnackbar] = useState(false);
              const [isProfileLoading, setIsProfileLoading] = useState(false);
            
              const [statusMessage, setStatusMessage] = useState({ type: '', message: '' });
            
          
           const handleUserChange = (e) => {
    const newUserType = e.target.value;
    setSelectedUser(newUserType);
  };
        
    const fetchBasicInformation = async () => {
      fetchUserProfile();
    };

     // Function to fetch user profile
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

 // Fetch profile on component mount
 useEffect(() => {
  fetchBasicInformation();
}, []); // Empty dependency array means this runs once on mount

          // Modify handleResumeLinkUpdate to clear the input after successful update
          const handleResumeLinkUpdate = async () => {
            if (!selectedUser || !newResumeLink) {
              setStatusMessage({ type: 'error', message: 'Please select a user and enter a resume link' });
              setOpenSnackbar(true);
              return;
            }
        
            try {
              const response = await axiosInstance.post('/api/update-resume-link', {
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

      // Add function to fetch resume link
      const fetchResumeLink = async (userType) => {
        setIsResumeLinkLoading(true);
        try {
          const response = await axiosInstance.get(`/api/get-resume-link/${userType}`);
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

      const capitalizeFirstLetter = (string) => {
        return string.charAt(0).toUpperCase() + string.slice(1);
      };
    
    return (
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
    )
}

export default ResumeManagement;