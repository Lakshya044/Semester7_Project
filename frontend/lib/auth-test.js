import React, { useState, useEffect } from 'react';
import {
  signInWithGooglePopup,
  signOutUser,
  getCurrentUser,
  getIdTokenForCurrentUser,
  onAuthStateChangedListener
} from './firebaseClient';

export default function AuthTestPage() {
  const [user, setUser] = useState(null);
  const [idToken, setIdToken] = useState(null);
  const [backendResp, setBackendResp] = useState(null);

  const backendBase = (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_API_URL) ? process.env.NEXT_PUBLIC_API_URL : 'http://localhost:5001';

  useEffect(() => {
    console.log('AuthTest: subscribing to auth state changes...');
    const unsub = onAuthStateChangedListener(async (u) => {
      console.log('AuthTest: onAuthStateChanged ->', !!u, u && (u.displayName || u.email));
      setUser(u);
      if (u) {
        try {
          const token = await getIdTokenForCurrentUser();
          setIdToken(token);
        } catch (e) {
          console.warn('AuthTest: could not get id token after state change', e && e.message ? e.message : e);
          setIdToken(null);
        }
      } else {
        setIdToken(null);
      }
    });
    return () => unsub();
  }, []);

  async function handleSignIn() {
    try {
      console.log('Starting Google sign-in...');
      const credential = await signInWithGooglePopup();
      const u = credential && credential.user ? credential.user : null;
      console.log('Sign-in resolved, user (from popup):', u && (u.displayName || u.email));
      // onAuthStateChanged listener will handle updating state and token; fetch token now for immediate use
      const token = await getIdTokenForCurrentUser();
      setIdToken(token);
      console.log('Obtained token after sign-in (truncated):', token ? token.slice(0, 120) + '...' : null);

      // Send ID token to backend to upsert user
      console.log('Sending ID token to backend /api/auth/google ...', backendBase);
      const resp = await fetch(`${backendBase}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken: token })
      });
      const respBody = await resp.json().catch(() => null);
      console.log('/api/auth/google response status:', resp.status, 'body:', respBody);
      setBackendResp({ status: resp.status, body: respBody });
    } catch (e) {
      console.error('Sign-in failed', e);
      alert('Sign-in failed: ' + (e.message || e));
    }
  }

  async function handleSignOut() {
    await signOutUser();
    // onAuthStateChanged will clear state; ensure local reset too
    setUser(null);
    setIdToken(null);
    setBackendResp(null);
  }

  async function refreshToken() {
    const t = await getIdTokenForCurrentUser();
    setIdToken(t);
  }

  async function sendTokenToBackend() {
    if (!idToken) {
      alert('No ID token available. Sign in first.');
      return;
    }
    try {
      const res = await fetch(`${backendBase}/api/history?userId=placeholder`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await res.json();
      setBackendResp({ status: res.status, body: data });
    } catch (e) {
      setBackendResp({ error: e.message || String(e) });
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Auth  (Google Sign-In)</h2>

      <div style={{ marginBottom: 16 }}>
        {!user ? (
          <button onClick={handleSignIn}>Sign in with Google</button>
        ) : (
          <>
            <div>
              Signed in as: {user.displayName || user.email} ({user.uid})
            </div>
            <div style={{ marginTop: 8 }}>
              <button onClick={handleSignOut}>Sign out</button>{' '}
              <button onClick={refreshToken}>Refresh Token</button>{' '}
              {/* <button onClick={sendTokenToBackend}>Send token to backend (/api/history)</button> */}
            </div>
          </>
        )}
      </div>

      {/* <div>
        <h4>ID Token (shortened)</h4>
        <pre style={{ maxWidth: '100%', whiteSpace: 'pre-wrap' }}>
          {idToken ? (idToken.slice(0, 200) + (idToken.length > 200 ? '... [truncated]' : '')) : 'No token'}
        </pre>
      </div>

      <div style={{ marginTop: 16 }}>
        <h4>Backend response</h4>
        <pre style={{ maxWidth: '100%', whiteSpace: 'pre-wrap' }}>
          {backendResp ? JSON.stringify(backendResp, null, 2) : 'No response yet'}
        </pre>
      </div> */}
    </div>
  );
}
