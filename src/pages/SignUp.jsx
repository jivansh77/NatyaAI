import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { app } from '../firebase';
import { getAuth, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { FcGoogle } from 'react-icons/fc';
import { GiLotus } from 'react-icons/gi';

const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

const SignUp = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const signupUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      navigate('/form');
    } catch (error) {
      setError('Failed to create account. Please try again.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const signupWithGoogle = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      console.log('Google Sign-Up Success:', result);
      navigate('/form');
    } catch (error) {
      setError('Failed to sign up with Google.');
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
            <h1 className="text-4xl font-bold text-orange-900">Begin Your Dance Journey</h1>
          </div>
          <p className="text-lg text-orange-800 mb-8">
            Join our community of classical dance enthusiasts and embark on a transformative journey through the rich traditions of Indian classical dance.
          </p>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="badge badge-primary bg-orange-600 border-none">✓</div>
              <span className="text-orange-800">Personalized learning experience</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="badge badge-primary bg-orange-600 border-none">✓</div>
              <span className="text-orange-800">Expert guidance and feedback</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="badge badge-primary bg-orange-600 border-none">✓</div>
              <span className="text-orange-800">Track your progress and achievements</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="badge badge-primary bg-orange-600 border-none">✓</div>
              <span className="text-orange-800">Connect with fellow dancers</span>
            </div>
          </div>
        </div>

        {/* Sign Up Form Card */}
        <div className="card flex-shrink-0 w-full max-w-sm shadow-2xl bg-white">
          <div className="card-body">
            <h2 className="text-2xl font-bold text-center text-orange-900 mb-6">Create Account</h2>
            
            {error && (
              <div className="alert alert-error mb-4">
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={signupUser}>
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-orange-900">Email</span>
                </label>
                <input 
                  onChange={(e) => setEmail(e.target.value)}
                  value={email}
                  type="email" 
                  placeholder="your@email.com" 
                  className="input input-bordered bg-orange-50" 
                  required 
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-orange-900">Password</span>
                </label>
                <input 
                  onChange={(e) => setPassword(e.target.value)}
                  value={password}
                  type="password" 
                  placeholder="Create a password" 
                  className="input input-bordered bg-orange-50" 
                  required 
                />
              </div>
              
              <div className="form-control mt-6">
                <button 
                  type="submit" 
                  className={`btn bg-orange-600 hover:bg-orange-700 text-white border-none ${loading ? 'loading' : ''}`}
                  disabled={loading}
                >
                  Create Account
                </button>
              </div>
              
              <div className="divider text-orange-900">OR</div>
              
              <button
                type="button"
                onClick={signupWithGoogle}
                className="btn btn-outline w-full border-orange-600 text-orange-600 hover:bg-orange-600 hover:border-orange-600"
                disabled={loading}
              >
                <FcGoogle className="w-5 h-5 mr-2" />
                Sign up with Google
              </button>

              <div className="text-center mt-6">
                <p className="text-sm text-orange-900">
                  Already have an account?{' '}
                  <Link to="/signin" className="text-orange-600 hover:text-orange-700 font-semibold">
                    Sign In
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
