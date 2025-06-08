import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  Typography,
  IconButton,
  Grid,
  Snackbar,
  Alert,
  Paper,
  Tabs,
  Tab,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import { 
  Delete as DeleteIcon, 
  Edit as EditIcon, 
  ContentCopy as ContentCopyIcon, 
  Preview as PreviewIcon,
  People as PeopleIcon,
  Close as CloseIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import axiosInstance from '../utils/axios';
import { useAuth } from '../contexts/AuthContext';
import { v4 as uuidv4 } from 'uuid';
import { templateLibrary } from '../utils/templateLibrary';

const ProfileManagement = () => {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [showOtherProfiles, setShowOtherProfiles] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    displayName: '',
    emailTemplate: '',
    followUpTemplate: '',
    resumeLink: ''
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [previewTab, setPreviewTab] = useState(0);
  const [previewData, setPreviewData] = useState({
    emailTemplate: '',
    followUpTemplate: ''
  });
  const [templateType, setTemplateType] = useState('email'); // 'email' or 'followup'
  const [selectedEmailTemplate, setSelectedEmailTemplate] = useState('');
  const [selectedFollowUpTemplate, setSelectedFollowUpTemplate] = useState('');
  const [styledEmailContent, setStyledEmailContent] = useState('');
  const [styledFollowUpContent, setStyledFollowUpContent] = useState('');
  const [previewEmailContent, setPreviewEmailContent] = useState('');
  const [previewFollowUpContent, setPreviewFollowUpContent] = useState('');

  // Add sample data for preview
  const sampleData = {
    firstName: 'John',
    Name: 'John Smith',
    Company: 'Example Corp',
    Email: 'john@example.com',
    Role: 'Software Engineer',
    Link: 'https://example.com/job'
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  useEffect(() => {
    if (templateType === 'email' && formData.emailTemplate) {
      setPreviewData({
        emailTemplate: formData.emailTemplate,
        followUpTemplate: formData.followUpTemplate
      });
    } else if (templateType === 'followup' && formData.followUpTemplate) {
      setPreviewData({
        emailTemplate: formData.emailTemplate,
        followUpTemplate: formData.followUpTemplate
      });
    }
  }, [formData.emailTemplate, formData.followUpTemplate, templateType]);

  useEffect(() => {
    if (formData.emailTemplate) {
      setStyledEmailContent(applyTemplateStyles(formData.emailTemplate, selectedEmailTemplate));
    }
    if (formData.followUpTemplate) {
      setStyledFollowUpContent(applyTemplateStyles(formData.followUpTemplate, selectedFollowUpTemplate));
    }
  }, [formData.emailTemplate, formData.followUpTemplate]);

  const fetchProfiles = async () => {
    try {
      const response = await axiosInstance.get('/api/user-profiles');
      setProfiles(response.data.userProfiles);
    } catch (error) {
      console.error('Error fetching profiles:', error);
      setSnackbar({
        open: true,
        message: 'Error fetching profiles',
        severity: 'error'
      });
    }
  };

  const validateGoogleDriveLink = (link) => {
    const driveRegex = /^https:\/\/drive\.google\.com\/(?:file\/d\/|open\?id=)([a-zA-Z0-9_-]+)/;
    return driveRegex.test(link);
  };

  const getGoogleDriveViewLink = (link) => {
    const match = link.match(/(?:file\/d\/|open\?id=)([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      return `https://drive.google.com/file/d/${match[1]}/preview`;
    }
    return link;
  };

  const handleOpenDialog = (profile = null) => {
    if (profile) {
      setSelectedProfile(profile);
      const newFormData = {
        name: profile.name || '',
        displayName: profile.displayName || '',
        emailTemplate: profile.emailTemplate || '',
        followUpTemplate: profile.followUpTemplate || '',
        resumeLink: profile.resumeLink || ''
      };
      setFormData(newFormData);
      
      // Initialize both styled and preview content
      updateContent(profile.emailTemplate || '', selectedEmailTemplate, true);
      updateContent(profile.followUpTemplate || '', selectedFollowUpTemplate, false);
    } else {
      setSelectedProfile(null);
      setFormData({
        name: '',
        displayName: '',
        emailTemplate: '',
        followUpTemplate: '',
        resumeLink: ''
      });
      setStyledEmailContent('');
      setStyledFollowUpContent('');
      setPreviewEmailContent('');
      setPreviewFollowUpContent('');
    }
    setOpenDialog(true);
    setPreviewTab(0);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedProfile(null);
    setFormData({
      name: '',
      displayName: '',
      emailTemplate: '',
      followUpTemplate: '',
      resumeLink: ''
    });
    setPreviewTab(0);
  };
  

  const applyTemplateStyles = (content, templateId) => {
    if (!templateId) return content;
    
    const template = templateLibrary[templateId];
    if (!template) return content;

    const templateHtml = template.template;
    const containerStart = templateHtml.indexOf('<div class="container">') + '<div class="container">'.length;
    const containerEnd = templateHtml.lastIndexOf('</div>');
    const templateContainer = templateHtml.substring(containerStart, containerEnd);

    return templateHtml.replace(templateContainer, content);
  };

  const replaceTemplateVariables = (content) => {
    if (!content) return '';
    
    // First handle the conditional Link statement
    const linkRegex = /\$\{Link \? `(.*?)` : ''\}/g;
    let processedContent = content.replace(linkRegex, (match, content) => {
      return sampleData.Link ? content.replace(/\$\{Link\}/g, sampleData.Link) : '';
    });

    // Then handle all other variables
    return processedContent
      .replace(/\$\{firstName\}/g, sampleData.firstName)
      .replace(/\$\{Name\}/g, sampleData.Name)
      .replace(/\$\{Company\}/g, sampleData.Company)
      .replace(/\$\{Email\}/g, sampleData.Email)
      .replace(/\$\{Role\}/g, sampleData.Role);
  };

  const updateContent = (content, templateId, isEmail = true) => {
    // Update styled content (with template but no sample data)
    const styledContent = applyTemplateStyles(content, templateId);
    if (isEmail) {
      setStyledEmailContent(styledContent);
    } else {
      setStyledFollowUpContent(styledContent);
    }

    // Update preview content (with template and sample data)
    const previewContent = applyTemplateStyles(replaceTemplateVariables(content), templateId);
    if (isEmail) {
      setPreviewEmailContent(previewContent);
    } else {
      setPreviewFollowUpContent(previewContent);
    }
  };

  const handleTemplateChange = (e) => {
    const templateId = e.target.value;
    if (templateType === 'email') {
      setSelectedEmailTemplate(templateId);
      updateContent(formData.emailTemplate, templateId, true);
    } else {
      setSelectedFollowUpTemplate(templateId);
      updateContent(formData.followUpTemplate, templateId, false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Update both styled and preview content
    if (name === 'emailTemplate') {
      updateContent(value, selectedEmailTemplate, true);
    } else if (name === 'followUpTemplate') {
      updateContent(value, selectedFollowUpTemplate, false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!formData.name || !formData.displayName) {
        setSnackbar({
          open: true,
          message: 'Name and Display Name are required',
          severity: 'error'
        });
        return;
      }

      if (formData.resumeLink && !validateGoogleDriveLink(formData.resumeLink)) {
        setSnackbar({
          open: true,
          message: 'Please provide a valid Google Drive link',
          severity: 'error'
        });
        return;
      }

      const profileData = {
        name: formData.name.toLowerCase(),
        displayName: formData.displayName.trim(),
        emailTemplate: styledEmailContent || formData.emailTemplate || '',
        followUpTemplate: styledFollowUpContent || formData.followUpTemplate || '',
        resumeLink: formData.resumeLink || ''
      };

      console.log('Submitting profile data:', profileData);

      if (selectedProfile) {
        const response = await axiosInstance.patch(`/api/user-profiles/${selectedProfile._id}`, profileData);
        console.log('Update response:', response.data);
        setSnackbar({
          open: true,
          message: 'Profile updated successfully',
          severity: 'success'
        });
      } else {
        const response = await axiosInstance.post('/api/user-profiles', {
          ...profileData,
          userId: uuidv4()
        });
        console.log('Create response:', response.data);
        setSnackbar({
          open: true,
          message: 'Profile created successfully',
          severity: 'success'
        });
      }
      handleCloseDialog();
      fetchProfiles();
    } catch (error) {
      console.error('Error saving profile:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error saving profile',
        severity: 'error'
      });
    }
  };

  const handleDelete = async (profileId) => {
    try {
      await axiosInstance.delete(`/api/user-profiles/${profileId}`);
      setSnackbar({
        open: true,
        message: 'Profile deleted successfully',
        severity: 'success'
      });
      fetchProfiles();
    } catch (error) {
      console.error('Error deleting profile:', error);
      setSnackbar({
        open: true,
        message: 'Error deleting profile',
        severity: 'error'
      });
    }
  };

  const handleCopyTemplate = (template) => {
    navigator.clipboard.writeText(template);
    setSnackbar({
      open: true,
      message: 'Template copied to clipboard',
      severity: 'success'
    });
  };

  const handlePreviewTemplates = (emailTemplate, followUpTemplate) => {
    // Process templates with conditional link handling
    const processedEmailTemplate = emailTemplate ? replaceTemplateVariables(emailTemplate) : '';
    const processedFollowUpTemplate = followUpTemplate ? replaceTemplateVariables(followUpTemplate) : '';

    setPreviewData({
      emailTemplate: processedEmailTemplate,
      followUpTemplate: processedFollowUpTemplate
    });
    setPreviewTab(1);
  };

  const isCurrentUserProfile = (profile) => {
    return user && profile.email === user.email;
  };

  const currentUserProfile = profiles.find(profile => isCurrentUserProfile(profile));
  const otherProfiles = profiles.filter(profile => !isCurrentUserProfile(profile));

  const getTemplateOptions = () => {
    return Object.entries(templateLibrary).map(([id, template]) => (
      <MenuItem key={id} value={id}>
        {template.name}
      </MenuItem>
    ));
  };

  const renderProfileCard = (profile, isEditable = false) => (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="h6" gutterBottom>
              {profile.name}
            </Typography>
            <Typography variant="subtitle1" color="textSecondary" gutterBottom>
              {profile.displayName}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              ID: {profile.userId}
            </Typography>
          </Box>
          {isEditable && (
            <IconButton onClick={() => handleOpenDialog(profile)}>
              <EditIcon />
            </IconButton>
          )}
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Resume Link */}
        {profile.resumeLink && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
              Resume Link
            </Typography>
            <Typography variant="body2">
              <a 
                href={getGoogleDriveViewLink(profile.resumeLink)} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ color: 'inherit', textDecoration: 'underline' }}
              >
                View Resume
              </a>
            </Typography>
          </Box>
        )}

        {/* Templates Section */}
        {(profile.emailTemplate || profile.followUpTemplate) && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
              Templates
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
              {profile.emailTemplate && (
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Email Template
                  </Typography>
                  <Box sx={{ 
                    p: 1, 
                    bgcolor: 'grey.100', 
                    borderRadius: 1,
                    mb: 1,
                    maxHeight: '100px',
                    overflow: 'auto'
                  }}>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                      {profile.emailTemplate}
                    </Typography>
                  </Box>
                </Box>
              )}
              {profile.followUpTemplate && (
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Follow-up Template
                  </Typography>
                  <Box sx={{ 
                    p: 1, 
                    bgcolor: 'grey.100', 
                    borderRadius: 1,
                    mb: 1,
                    maxHeight: '100px',
                    overflow: 'auto'
                  }}>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                      {profile.followUpTemplate}
                    </Typography>
                  </Box>
                </Box>
              )}
            </Box>
            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
              <Button
                size="small"
                variant="outlined"
                startIcon={<ContentCopyIcon />}
                onClick={() => handleCopyTemplate(profile.emailTemplate)}
                disabled={!profile.emailTemplate}
              >
                Copy Email Template
              </Button>
              <Button
                size="small"
                variant="outlined"
                startIcon={<ContentCopyIcon />}
                onClick={() => handleCopyTemplate(profile.followUpTemplate)}
                disabled={!profile.followUpTemplate}
              >
                Copy Follow-up Template
              </Button>
              <Button
                size="small"
                variant="outlined"
                startIcon={<PreviewIcon />}
                onClick={() => handlePreviewTemplates(profile.emailTemplate, profile.followUpTemplate)}
                disabled={!profile.emailTemplate && !profile.followUpTemplate}
              >
                Preview Templates
              </Button>
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">Profile Management</Typography>
        <Button 
          variant="outlined" 
          startIcon={<PeopleIcon />}
          onClick={() => setShowOtherProfiles(true)}
        >
          View Other Profiles
        </Button>
      </Box>

      {/* Current User's Profile */}
      {currentUserProfile ? (
        renderProfileCard(currentUserProfile, true)
      ) : (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="textSecondary" gutterBottom>
            No profile found
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => handleOpenDialog()}
          >
            Create Profile
          </Button>
        </Box>
      )}

      {/* Other Profiles Dialog */}
      <Dialog
        open={showOtherProfiles}
        onClose={() => setShowOtherProfiles(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Other Profiles</Typography>
            <IconButton onClick={() => setShowOtherProfiles(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            {otherProfiles.map((profile) => (
              <Grid item xs={12} key={profile._id}>
                {renderProfileCard(profile)}
              </Grid>
            ))}
          </Grid>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedProfile ? 'Edit Profile' : 'Add New Profile'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Display Name"
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Resume Link (Google Drive)"
                  name="resumeLink"
                  value={formData.resumeLink}
                  onChange={handleChange}
                  placeholder="https://drive.google.com/file/d/..."
                  helperText="Enter a Google Drive link to your resume"
                />
              </Grid>
              <Grid item xs={12}>
                <Tabs 
                  value={templateType} 
                  onChange={(e, newValue) => setTemplateType(newValue)}
                  sx={{ mb: 2 }}
                >
                  <Tab label="Email Template" value="email" />
                  <Tab label="Follow-up Template" value="followup" />
                </Tabs>
                {templateType === 'email' ? (
                  <>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Email Template"
                          name="emailTemplate"
                          value={formData.emailTemplate}
                          onChange={handleChange}
                          multiline
                          rows={6}
                          placeholder="Enter your email template here..."
                        />
                        <FormControl fullWidth sx={{ mt: 2 }}>
                          <InputLabel>Select Template Style</InputLabel>
                          <Select
                            value={selectedEmailTemplate}
                            onChange={handleTemplateChange}
                            label="Select Template Style"
                          >
                            <MenuItem value="">No Template</MenuItem>
                            {getTemplateOptions()}
                          </Select>
                        </FormControl>
                        <Button
                          fullWidth
                          variant="contained"
                          startIcon={<SaveIcon />}
                          onClick={() => setStyledEmailContent(applyTemplateStyles(formData.emailTemplate, selectedEmailTemplate))}
                          sx={{ mt: 2 }}
                        >
                          Apply Template Style
                        </Button>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" gutterBottom>
                          Preview
                        </Typography>
                        <Box sx={{ 
                          p: 2, 
                          bgcolor: 'grey.100', 
                          borderRadius: 1,
                          height: '400px',
                          overflow: 'auto',
                          border: '1px solid #e0e0e0'
                        }}>
                          {previewEmailContent ? (
                            <iframe
                              srcDoc={previewEmailContent}
                              style={{
                                width: '100%',
                                height: '100%',
                                border: 'none',
                                backgroundColor: 'white'
                              }}
                              title="Email Template Preview"
                            />
                          ) : (
                            <Box sx={{ 
                              height: '100%', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center',
                              color: 'text.secondary'
                            }}>
                              <Typography>Enter content and select a template to see preview</Typography>
                            </Box>
                          )}
                        </Box>
                      </Grid>
                    </Grid>
                  </>
                ) : (
                  <>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Follow-up Template"
                          name="followUpTemplate"
                          value={formData.followUpTemplate}
                          onChange={handleChange}
                          multiline
                          rows={6}
                          placeholder="Enter your follow-up template here..."
                        />
                        <FormControl fullWidth sx={{ mt: 2 }}>
                          <InputLabel>Select Template Style</InputLabel>
                          <Select
                            value={selectedFollowUpTemplate}
                            onChange={handleTemplateChange}
                            label="Select Template Style"
                          >
                            <MenuItem value="">No Template</MenuItem>
                            {getTemplateOptions()}
                          </Select>
                        </FormControl>
                        <Button
                          fullWidth
                          variant="contained"
                          startIcon={<SaveIcon />}
                          onClick={() => setStyledFollowUpContent(applyTemplateStyles(formData.followUpTemplate, selectedFollowUpTemplate))}
                          sx={{ mt: 2 }}
                        >
                          Apply Template Style
                        </Button>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" gutterBottom>
                          Preview
                        </Typography>
                        <Box sx={{ 
                          p: 2, 
                          bgcolor: 'grey.100', 
                          borderRadius: 1,
                          height: '400px',
                          overflow: 'auto',
                          border: '1px solid #e0e0e0'
                        }}>
                          {previewFollowUpContent ? (
                            <iframe
                              srcDoc={previewFollowUpContent}
                              style={{
                                width: '100%',
                                height: '100%',
                                border: 'none',
                                backgroundColor: 'white'
                              }}
                              title="Follow-up Template Preview"
                            />
                          ) : (
                            <Box sx={{ 
                              height: '100%', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center',
                              color: 'text.secondary'
                            }}>
                              <Typography>Enter content and select a template to see preview</Typography>
                            </Box>
                          )}
                        </Box>
                      </Grid>
                    </Grid>
                  </>
                )}
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {selectedProfile ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Template Preview Dialog */}
      <Dialog
        open={previewTab === 1}
        onClose={() => setPreviewTab(0)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>Template Preview</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              {previewData.emailTemplate && (
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    Email Template
                  </Typography>
                  <Box sx={{ 
                    p: 2, 
                    bgcolor: 'grey.100', 
                    borderRadius: 1,
                    height: '500px'
                  }}>
                    <iframe
                      srcDoc={previewData.emailTemplate}
                      style={{
                        width: '100%',
                        height: '100%',
                        border: 'none',
                        backgroundColor: 'white'
                      }}
                      title="Email Template Preview"
                    />
                  </Box>
                </Grid>
              )}
              {previewData.followUpTemplate && (
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    Follow-up Template
                  </Typography>
                  <Box sx={{ 
                    p: 2, 
                    bgcolor: 'grey.100', 
                    borderRadius: 1,
                    height: '500px'
                  }}>
                    <iframe
                      srcDoc={previewData.followUpTemplate}
                      style={{
                        width: '100%',
                        height: '100%',
                        border: 'none',
                        backgroundColor: 'white'
                      }}
                      title="Follow-up Template Preview"
                    />
                  </Box>
                </Grid>
              )}
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewTab(0)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProfileManagement; 