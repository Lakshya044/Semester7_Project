"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { FileText, Sparkles, Loader2, LogIn } from 'lucide-react';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const { login, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If already authenticated, redirect to dashboard
    if (!authLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, authLoading, router]);

  const handleLogin = async () => {
    setIsLoading(true);
    setError(null);
    setIsRedirecting(false);
    try {
      await login();
      // If redirect was initiated, don't try to navigate (page will redirect)
      // Otherwise, redirect will happen automatically via useEffect when auth state updates
      // Small delay to ensure auth state has updated
      setTimeout(() => {
        if (isAuthenticated) {
          router.push('/dashboard');
        }
      }, 500);
    } catch (err: any) {
      // Don't show error if redirect was initiated
      if (err?.message === 'REDIRECT_INITIATED') {
        // Page will redirect, show redirecting message
        setIsRedirecting(true);
        return;
      }
      setError(err?.message || 'Failed to sign in. Please try again.');
      setIsLoading(false);
    }
  };

  // Show loading state while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-red-700 to-red-600 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  // Don't render if already authenticated (redirect will happen)
  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-red-700 to-red-600 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        {/* Floating PDF Icons */}
        <div className="absolute top-20 left-20 opacity-10">
          <FileText className="w-16 h-16 text-white animate-float" />
        </div>
        <div className="absolute top-40 right-32 opacity-10">
          <FileText className="w-20 h-20 text-white animate-float-delayed" />
        </div>
        <div className="absolute bottom-32 left-40 opacity-10">
          <FileText className="w-12 h-12 text-white animate-float-slow" />
        </div>
        
        {/* Geometric Shapes */}
        <div className="absolute top-32 right-20 w-32 h-32 border-2 border-white/20 rounded-full animate-spin-slow"></div>
        <div className="absolute bottom-20 right-20 w-24 h-24 bg-white/10 rounded-lg transform rotate-45 animate-pulse"></div>
        <div className="absolute top-1/2 left-10 w-16 h-16 bg-gradient-to-r from-white/20 to-transparent rounded-full animate-ping"></div>
        
        {/* Gradient Orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-red-400/30 to-orange-500/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-gradient-to-r from-red-600/20 to-red-800/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-8">
        {/* Logo/Icon Section */}
        <div className="mb-8 animate-scale-in">
          <div className="relative">
            <div className="w-24 h-24 bg-white/20 rounded-2xl backdrop-blur-sm border border-white/30 flex items-center justify-center mb-6 mx-auto animate-bounce-gentle">
              <FileText className="w-12 h-12 text-white" />
              <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-yellow-300 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Main Title */}
        <div className="mb-8 animate-fade-in-up text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 tracking-tight">
            <span className="inline-block animate-letter-float">A</span>
            <span className="inline-block animate-letter-float delay-100">X</span>
            <span className="inline-block animate-letter-float delay-200">O</span>
            <span className="inline-block animate-letter-float delay-300">N</span>
            <span className="mx-3"></span>
            <span className="inline-block animate-letter-float delay-400">D</span>
            <span className="inline-block animate-letter-float delay-500">O</span>
            <span className="inline-block animate-letter-float delay-600">C</span>
            <span className="inline-block animate-letter-float delay-700">S</span>
          </h1>
          
          <div className="relative">
            <h2 className="text-2xl md:text-3xl font-semibold text-red-100 mb-2">
              Sign in to continue
            </h2>
            {/* Animated underline */}
            <div className="w-64 h-1 bg-gradient-to-r from-transparent via-white to-transparent mx-auto mt-4 animate-shine"></div>
          </div>
        </div>

        {/* Login Card */}
        <div className="w-full max-w-md animate-fade-in-up delay-500">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl p-8">
            {/* Error Message */}
            {error && (
              <div className="mb-6 bg-red-500/20 border border-red-400/50 rounded-lg p-4">
                <p className="text-sm text-white">{error}</p>
              </div>
            )}

            {/* Welcome Text */}
            <div className="text-center mb-8">
              <p className="text-red-100 text-lg mb-2">
                Welcome back!
              </p>
              <p className="text-red-200 text-sm">
                Sign in with your Google account to access your document analysis workspace
              </p>
            </div>

            {/* Google Sign In Button */}
            <button
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full bg-white hover:bg-red-50 disabled:bg-gray-300 text-red-700 font-semibold py-4 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl disabled:shadow-none disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                  <LogIn className="w-5 h-5" />
                </>
              )}
            </button>

            {/* Additional Info */}
            <div className="mt-6 text-center space-y-2">
              <p className="text-red-200 text-xs">
                By signing in, you agree to our Terms of Service and Privacy Policy
              </p>
              {isLoading && (
                <p className="text-red-100 text-xs animate-pulse">
                  {isRedirecting ? 'Redirecting to Google...' : 'Signing in...'}
                </p>
              )}
            </div>
          </div>

          {/* Feature Highlights */}
          <div className="mt-8 grid grid-cols-3 gap-4 text-center">
            <div className="text-white/80">
              <div className="text-2xl font-bold mb-1">AI</div>
              <div className="text-xs">Powered</div>
            </div>
            <div className="text-white/80">
              <div className="text-2xl font-bold mb-1">Fast</div>
              <div className="text-xs">Analysis</div>
            </div>
            <div className="text-white/80">
              <div className="text-2xl font-bold mb-1">Secure</div>
              <div className="text-xs">Processing</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

