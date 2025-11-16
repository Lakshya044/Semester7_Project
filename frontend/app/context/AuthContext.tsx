// app/context/AuthContext.tsx
"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  onAuthStateChangedListener, 
  signInWithGooglePopup, 
  signOutUser, 
  getCurrentUser,
  getIdTokenForCurrentUser,
  getRedirectResult as getFirebaseRedirectResult
} from '../../lib/firebaseClient';

interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for redirect result first (when returning from Google OAuth)
    const checkRedirectResult = async () => {
      try {
        const result = await getFirebaseRedirectResult();
        if (result && result.user) {
          // User just signed in via redirect, sync with backend
          const idToken = await getIdTokenForCurrentUser();
          if (idToken) {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
            await fetch(`${API_URL}/api/auth/google`, {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${idToken}`
              },
              body: JSON.stringify({ idToken })
            });
          }
        }
      } catch (error) {
        console.error('Error checking redirect result:', error);
      }
    };

    checkRedirectResult();

    const unsubscribe = onAuthStateChangedListener(async (firebaseUser) => {
      if (firebaseUser) {
        // If user is authenticated, sync with backend
        try {
          const idToken = await getIdTokenForCurrentUser();
          if (idToken) {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
            await fetch(`${API_URL}/api/auth/google`, {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${idToken}`
              },
              body: JSON.stringify({ idToken })
            });
          }
        } catch (error) {
          console.error('Failed to sync user with backend:', error);
        }

        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async () => {
    try {
      const credential = await signInWithGooglePopup();
      const idToken = await getIdTokenForCurrentUser();
      
      if (idToken) {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
        const response = await fetch(`${API_URL}/api/auth/google`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`
          },
          body: JSON.stringify({ idToken })
        });

        if (!response.ok) {
          throw new Error('Failed to authenticate with backend');
        }
      }
    } catch (error: any) {
      // If redirect was initiated, don't throw - the page will redirect
      if (error?.message === 'REDIRECT_INITIATED') {
        // Page will redirect, just return
        return;
      }
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOutUser();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      isAuthenticated: !!user, 
      login, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
