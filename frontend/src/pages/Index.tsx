import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated, hasProfile } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate(hasProfile ? '/dashboard' : '/profile/create');
    } else {
      navigate('/');
    }
  }, [isAuthenticated, hasProfile, navigate]);

  return null;
};

export default Index;