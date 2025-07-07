import React, { useState, useEffect } from 'react';

// Load environment variables
const BASEBASE_API_KEY = import.meta.env.VITE_BASEBASE_API_KEY;

type AuthStep = 'phone' | 'verification' | 'success';

interface FormData {
  name: string;
  phone: string;
  code: string;
}

interface User {
  id: string;
  name: string;
  phone: string;
  profileImageUrl: string | null;
}

const SignIn: React.FC = () => {
  const [step, setStep] = useState<AuthStep>('phone');
  const [formData, setFormData] = useState<FormData>({
    name: '',
    phone: '',
    code: ''
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userLoading, setUserLoading] = useState<boolean>(false);
  const [userError, setUserError] = useState<string>('');
  const [initializing, setInitializing] = useState<boolean>(true);

  const normalizePhoneNumber = (phone: string): string => {
    // Remove all non-digit characters
    const digitsOnly = phone.replace(/\D/g, '');
    
    // Handle different cases
    if (digitsOnly.length === 11 && digitsOnly.startsWith('1')) {
      // Already has country code
      return `+${digitsOnly}`;
    } else if (digitsOnly.length === 10) {
      // US number without country code
      return `+1${digitsOnly}`;
    } else if (digitsOnly.length > 11) {
      // Too many digits, take the last 10 and assume US
      const last10 = digitsOnly.slice(-10);
      return `+1${last10}`;
    } else {
      // Less than 10 digits or other edge cases, return as-is with + prefix
      return `+${digitsOnly}`;
    }
  };

  const callGraphQL = async (query: string, variables: Record<string, unknown> = {}, useAuth: boolean = false) => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (useAuth) {
      const token = localStorage.getItem('basebase_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    const response = await fetch('https://app.basebase.us/graphql', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        query,
        variables
      })
    });

    const result = await response.json();
    
    if (result.errors) {
      console.error("GraphQL error response:", JSON.stringify(result.errors, null, 2));
      const errorMessage = result.errors[0]?.message ?? 'An unknown error occurred';
      throw new Error(errorMessage);
    }
    
    return result.data;
  };

  const fetchCurrentUser = async () => {
    console.log('🔍 Fetching current user...');
    setUserLoading(true);
    setUserError('');

    try {
      const query = `
        query GetMyUser {
          getMyUser {
            id
            name
            phone
            profileImageUrl
          }
        }
      `;

      console.log('📡 Sending getMyUser query...');
      const data = await callGraphQL(query, {}, true);
      console.log('✅ Received user data:', data);
      console.log('👤 User object:', data.getMyUser);
      console.log('🖼️ Profile image URL:', data.getMyUser?.profileImageUrl);
      
      setCurrentUser(data.getMyUser);
    } catch (err) {
      console.error('❌ Error fetching user:', err);
      setUserError(err instanceof Error ? err.message : 'Failed to fetch user information');
    } finally {
      setUserLoading(false);
    }
  };

  // Check for existing token on component mount
  useEffect(() => {
    const checkExistingToken = async () => {
      console.log('🔍 Checking for existing token...');
      const token = localStorage.getItem('basebase_token');
      
      if (token) {
        console.log('🎫 Found existing token, validating...');
        try {
          // Try to fetch user data to validate the token
          const query = `
            query GetMyUser {
              getMyUser {
                id
                name
                phone
                profileImageUrl
              }
            }
          `;

          const data = await callGraphQL(query, {}, true);
          console.log('✅ Token is valid, user data:', data.getMyUser);
          
          // Token is valid, go to success page
          setCurrentUser(data.getMyUser);
          setStep('success');
        } catch (err) {
          console.log('❌ Token is invalid or expired, removing from storage', err);
          localStorage.removeItem('basebase_token');
          // Stay on phone step
        }
      } else {
        console.log('🚫 No existing token found');
      }
      
      setInitializing(false);
    };

    checkExistingToken();
  }, []);

  useEffect(() => {
    console.log('🔄 Step changed to:', step);
    if (step === 'success') {
      console.log('🎉 Reached success step, fetching user...');
      fetchCurrentUser();
    }
  }, [step]);

  useEffect(() => {
    console.log('👤 Current user state updated:', currentUser);
    if (currentUser) {
      console.log('🖼️ Has profile image?', !!currentUser.profileImageUrl);
      console.log('🖼️ Profile image URL value:', currentUser.profileImageUrl);
    }
  }, [currentUser]);

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const mutation = `
        mutation RequestCode($phone: String!, $name: String!) {
          requestCode(phone: $phone, name: $name)
        }
      `;

      const normalizedPhone = normalizePhoneNumber(formData.phone);

      await callGraphQL(mutation, {
        phone: normalizedPhone,
        name: formData.name
      });

      // Update formData with normalized phone for consistency
      setFormData(prev => ({
        ...prev,
        phone: normalizedPhone
      }));

      setStep('verification');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const mutation = `
        mutation VerifyCode($phone: String!, $code: String!, $projectApiKey: String!) {
          verifyCode(phone: $phone, code: $code, projectApiKey: $projectApiKey)
        }
      `;

      const normalizedPhone = normalizePhoneNumber(formData.phone);

      if (!BASEBASE_API_KEY) {
        throw new Error('BASEBASE_API_KEY environment variable is required');
      }

      const data = await callGraphQL(mutation, {
        phone: normalizedPhone,
        code: formData.code,
        projectApiKey: BASEBASE_API_KEY
      });

      // Save JWT to localStorage
      localStorage.setItem('basebase_token', data.verifyCode);
      
      setStep('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify code');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const resetForm = () => {
    setStep('phone');
    setFormData({ name: '', phone: '', code: '' });
    setError('');
  };

  const handleSignOut = () => {
    // Remove JWT from localStorage
    localStorage.removeItem('basebase_token');
    resetForm();
  };

  // Show loading screen while checking for existing token
  if (initializing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mx-auto flex items-center justify-center mb-4 animate-pulse">
              <span className="text-3xl">🔍</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Loading...</h1>
            <p className="text-lg text-gray-600">
              Checking authentication status
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full mx-auto flex items-center justify-center mb-4">
              <span className="text-3xl">✅</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Success!</h1>
            
            {userLoading && (
              <p className="text-lg text-gray-600">
                Loading your profile...
              </p>
            )}
            
            {userError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{userError}</p>
              </div>
            )}
            
            {currentUser && !userLoading && (
              <div className="space-y-4">
                {(() => {
                  console.log('🎨 Rendering user UI. Has profile image?', !!currentUser.profileImageUrl);
                  console.log('🎨 Profile image URL for rendering:', currentUser.profileImageUrl);
                  return null;
                })()}
                {currentUser.profileImageUrl ? (
                  <div className="flex justify-center">
                    <img
                      src={currentUser.profileImageUrl}
                      alt={`${currentUser.name}'s profile`}
                      className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                      onLoad={() => console.log('🖼️ Profile image loaded successfully')}
                      onError={() => console.log('❌ Profile image failed to load')}
                    />
                  </div>
                ) : (() => {
                  console.log('🚫 No profile image URL available');
                  return null;
                })()}
                <div className="space-y-2">
                  <p className="text-lg text-gray-600">
                    Welcome back, <span className="font-semibold text-gray-900">{currentUser.name}</span>!
                  </p>
                  <p className="text-sm text-gray-500">
                    Signed in as {currentUser.phone}
                  </p>
                </div>
              </div>
            )}
            
            {!currentUser && !userLoading && !userError && (
              <p className="text-lg text-gray-600">
                You're now authenticated with BaseBase
              </p>
            )}
          </div>
          
          <button 
            onClick={handleSignOut}
            className="w-full bg-gradient-to-r from-red-500 to-pink-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-red-600 hover:to-pink-700 transition-all duration-200 transform hover:scale-105"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {step === 'phone' ? 'Sign In' : 'Enter Verification Code'}
          </h1>
          <p className="text-lg text-gray-600">
            {step === 'phone' 
              ? 'Enter your details to get started' 
              : 'Check your phone for the 6-digit code'
            }
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {step === 'phone' ? (
          <form onSubmit={handleRequestCode} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                placeholder="+1234567890"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? 'Sending Code...' : 'Send Verification Code'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyCode} className="space-y-6">
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                Verification Code
              </label>
              <input
                type="text"
                id="code"
                name="code"
                value={formData.code}
                onChange={handleInputChange}
                required
                maxLength={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 text-center text-2xl tracking-widest"
                placeholder="123456"
              />
            </div>

            <div className="space-y-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? 'Verifying...' : 'Verify Code'}
              </button>

              <button
                type="button"
                onClick={() => setStep('phone')}
                className="w-full bg-gray-100 text-gray-700 font-semibold py-3 px-6 rounded-lg hover:bg-gray-200 transition-all duration-200"
              >
                Back to Phone Entry
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default SignIn; 