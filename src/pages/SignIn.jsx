import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { FcGoogle } from 'react-icons/fc';
import { GiLotus } from 'react-icons/gi';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleEmailSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Check if user has filled out the form
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists() || !userDoc.data().danceProfile) {
        navigate('/form'); // Redirect to Form page if not filled
      } else {
        navigate('/dashboard'); // Redirect to dashboard if already filled
      }
    } catch (error) {
      setError('Failed to sign in. Please check your credentials.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    const provider = new GoogleAuthProvider();
    
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Check if user exists in Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (!userDoc.exists()) {
        // Create new user document if first time
        await setDoc(doc(db, 'users', user.uid), {
          email: user.email,
          name: user.displayName,
          photoURL: user.photoURL,
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString()
        });
        navigate('/form');
      } else {
        // Update last login
        await setDoc(doc(db, 'users', user.uid), {
          lastLogin: new Date().toISOString()
        }, { merge: true });
        navigate('/dashboard');
      }
    } catch (error) {
      setError('Failed to sign in with Google.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col lg:flex-row items-center justify-center gap-12 w-full max-w-6xl">
        {/* Info Section */}
        <div className="text-center lg:text-left max-w-md">
          <div className="flex items-center justify-center lg:justify-start gap-3 mb-6">
            <GiLotus className="w-10 h-10 text-orange-600" />
            <h1 className="text-4xl font-bold text-orange-900">Welcome Back!</h1>
          </div>
          <p className="text-lg text-orange-800 mb-8">
            Continue your journey in the beautiful world of classical dance. Your next performance awaits!
          </p>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="badge badge-primary bg-orange-600 border-none">✓</div>
              <span className="text-orange-800">Resume your practice sessions</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="badge badge-primary bg-orange-600 border-none">✓</div>
              <span className="text-orange-800">Track your progress</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="badge badge-primary bg-orange-600 border-none">✓</div>
              <span className="text-orange-800">Connect with your dance community</span>
            </div>
          </div>
        </div>

        {/* Sign In Form Card */}
        <div className="card flex-shrink-0 w-full max-w-sm shadow-2xl bg-white">
          <div className="card-body">
            <h2 className="text-2xl font-bold text-center text-orange-900 mb-6">Sign In</h2>
            
            {error && (
              <div className="alert alert-error mb-4">
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleEmailSignIn} className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-orange-900">Email</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input input-bordered bg-orange-50"
                  required
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text text-orange-900">Password</span>
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input input-bordered bg-orange-50"
                  required
                />
              </div>

              <button 
                type="submit" 
                className={`btn bg-orange-600 hover:bg-orange-700 text-white border-none w-full ${loading ? 'loading' : ''}`}
                disabled={loading}
              >
                Sign In
              </button>
            </form>

            <div className="divider text-orange-900">OR</div>

            <button
              onClick={handleGoogleSignIn}
              className="btn btn-outline w-full border-orange-600 text-orange-600 hover:bg-orange-600 hover:border-orange-600"
              disabled={loading}
            >
              <FcGoogle className="w-5 h-5 mr-2" />
              Sign in with Google
            </button>

            <p className="text-center mt-6">
              <span className="text-sm text-orange-900">
                New to NatyaAI?{' '}
                <Link to="/signup" className="text-orange-600 hover:text-orange-700 font-semibold">
                  Create Account
                </Link>
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}