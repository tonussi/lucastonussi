import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { LoginForm } from '../components/login-form';
import { useAuth } from '../lib/auth-context';

export default function LoginPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  if (user) {
    return null; // Will redirect
  }

  return <LoginForm />;
}
