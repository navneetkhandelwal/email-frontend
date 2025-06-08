import { useState, useEffect } from 'react';
import axiosInstance from '../utils/axios';
import { useAuth } from '../contexts/AuthContext';

const useUserProfile = () => {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUserProfile = async () => {
    if (!user?.email) {
      setError('User not authenticated');
      return null;
    }

    setIsLoading(true);
    setError(null);
    try {
      // First try to get the current user's profile
      const response = await axiosInstance.get('/api/user-profiles/me');
      setUserProfile(response.data);
      return response.data;
    } catch (err) {
      // If profile doesn't exist, create one
      if (err.response?.status === 404) {
        try {
          const newProfile = await createUserProfile({
            userId: user.id,
            name: user.email.split('@')[0],
            displayName: user.email.split('@')[0],
            email: user.email
          });
          setUserProfile(newProfile);
          return newProfile;
        } catch (createErr) {
          const errorMessage = createErr.response?.data?.message || 'Failed to create user profile';
          setError(errorMessage);
          throw new Error(errorMessage);
        }
      } else {
        const errorMessage = err.response?.data?.message || 'Failed to fetch user profile';
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserProfile = async (profileData) => {
    if (!userProfile?._id) {
      throw new Error('No profile found to update');
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.patch(`/api/user-profiles/${userProfile._id}`, profileData);
      setUserProfile(response.data);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to update user profile';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const createUserProfile = async (profileData) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.post('/api/user-profiles', profileData);
      setUserProfile(response.data);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to create user profile';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch profile on mount
  useEffect(() => {
    if (user?.email) {
      fetchUserProfile();
    }
  }, [user?.email]);

  return {
    userProfile,
    isLoading,
    error,
    fetchUserProfile,
    updateUserProfile,
    createUserProfile
  };
};

export default useUserProfile; 