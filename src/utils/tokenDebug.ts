/**
 * Token Debugging Utilities
 * Use these functions to debug token storage and retrieval issues
 */

/**
 * Check if token is stored in localStorage
 */
export function checkTokenStorage(): {
  hasToken: boolean;
  hasUser: boolean;
  token: string | null;
  tokenLength: number;
  user: any | null;
} {
  if (typeof window === 'undefined') {
    return {
      hasToken: false,
      hasUser: false,
      token: null,
      tokenLength: 0,
      user: null,
    };
  }

  const token = localStorage.getItem('hanbuy_token');
  const userStr = localStorage.getItem('hanbuy_user');
  let user = null;
  
  try {
    if (userStr) {
      user = JSON.parse(userStr);
    }
  } catch (e) {
    console.error('Failed to parse user from localStorage:', e);
  }

  return {
    hasToken: !!token,
    hasUser: !!user,
    token,
    tokenLength: token?.length || 0,
    user,
  };
}

/**
 * Log token storage status to console
 */
export function logTokenStatus(): void {
  const status = checkTokenStorage();
  
  console.log('🔍 Token Storage Status:', {
    hasToken: status.hasToken,
    hasUser: status.hasUser,
    tokenLength: status.tokenLength,
    tokenPreview: status.token ? status.token.substring(0, 20) + '...' : 'none',
    userEmail: status.user?.email || 'none',
    localStorageKeys: typeof window !== 'undefined' 
      ? Object.keys(localStorage).filter(key => key.includes('hanbuy'))
      : []
  });
}

/**
 * Clear all auth data from localStorage
 */
export function clearAuthData(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('hanbuy_token');
    localStorage.removeItem('hanbuy_user');
    sessionStorage.removeItem('last_login_time');
    console.log('🗑️ Cleared all auth data from storage');
  }
}

/**
 * Test if token is being sent in requests
 * Call this in browser console to test
 */
export function testTokenInRequest(): void {
  if (typeof window === 'undefined') return;
  
  const token = localStorage.getItem('hanbuy_token');
  
  if (!token) {
    console.error('❌ No token found in localStorage');
    console.log('Available localStorage keys:', Object.keys(localStorage));
    return;
  }
  
  console.log('✅ Token found:', {
    token: token.substring(0, 30) + '...',
    length: token.length,
    startsWithBearer: token.startsWith('Bearer '),
    trimmed: token.trim().substring(0, 30) + '...'
  });
  
  // Test if we can create a request with the token
  const testHeaders = {
    'Authorization': `Bearer ${token.trim()}`,
    'Content-Type': 'application/json'
  };
  
  console.log('📤 Test Headers:', {
    ...testHeaders,
    authHeaderPreview: testHeaders.Authorization.substring(0, 50) + '...'
  });
  
  // Test actual API call
  console.log('🧪 Testing token with actual API call...');
  fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://hanbuyapi.onrender.com/api'}/auth/me`, {
    method: 'GET',
    headers: testHeaders
  })
    .then(res => {
      console.log('✅ Test API call response:', {
        status: res.status,
        statusText: res.statusText,
        headers: Object.fromEntries(res.headers.entries())
      });
      return res.json();
    })
    .then(data => {
      console.log('✅ Test API call data:', data);
    })
    .catch(err => {
      console.error('❌ Test API call failed:', err);
    });
}

/**
 * Manually set token in localStorage (for testing)
 */
export function setTokenManually(token: string): void {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem('hanbuy_token', token.trim());
  const stored = localStorage.getItem('hanbuy_token');
  console.log('✅ Token manually set:', {
    success: stored === token.trim(),
    length: stored?.length || 0,
    preview: stored?.substring(0, 30) + '...'
  });
}

// Make functions available globally in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).tokenDebug = {
    check: checkTokenStorage,
    log: logTokenStatus,
    clear: clearAuthData,
    test: testTokenInRequest,
    setToken: setTokenManually,
  };
  
  console.log('🔧 Token debug utilities available. Use window.tokenDebug in console:');
  console.log('  - window.tokenDebug.check() - Check token storage');
  console.log('  - window.tokenDebug.log() - Log token status');
  console.log('  - window.tokenDebug.clear() - Clear all auth data');
  console.log('  - window.tokenDebug.test() - Test token in request');
  console.log('  - window.tokenDebug.setToken("token") - Manually set token');
}
