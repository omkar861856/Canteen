import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from './store/hooks/hooks';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isLoggedIn } = useAppSelector((state) => state.auth);
  const {kitchenId} = useAppSelector(state=>state.app)

  // If the user is not authenticated, redirect to the login page
  if (!isLoggedIn) {
    return <Navigate to={`/${kitchenId}/signin`} replace />;
  }
  // If the user is authenticated, render the children (protected content)
  return <>{children}</>;
};

export default ProtectedRoute;