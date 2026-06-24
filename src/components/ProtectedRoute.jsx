import React from 'react'
import { Navigate } from 'react-router-dom';
import {useAuth} from '../hooks/useAuth';
function ProtectedRoute({children,allowedRoles}) {
  const {user,isAuthenticated,loading}=useAuth();
  if(loading){
    return (
      <div className='flex h-screen items-center justify-center bg-slate-50'>
        <p className="text-slate-400">Loading...</p>
      </div>
    );
  }
  if(!isAuthenticated) {
    return <Navigate to='/login' replace />;
  }
   if(allowedRoles && !allowedRoles.includes(user.role)) {
       return <Navigate to='/dashboard' replace />;
   }
   return children;
}

export default ProtectedRoute
