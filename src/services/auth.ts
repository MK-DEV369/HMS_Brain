import { User } from "../utils/types";

class AuthService {
  private _isAuthenticated: boolean;
  private _token: string | null;
  private _user: User | null;

  constructor() {
    this._isAuthenticated = false;
    this._token = null;
    this._user = null;
  }

  async login(username: string, password: string): Promise<boolean> {
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      this._isAuthenticated = true;
      if (data.token) {
        this._token = data.token;
        localStorage.setItem('authToken', this._token!);
      } else {
        console.error('No token received from server');
        return false;
      }

      this._user = data.user;

      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  }

  async logout(): Promise<boolean> {
    try {
      localStorage.removeItem('authToken');
      this._isAuthenticated = false;
      this._token = null;
      this._user = null;
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      return false;
    }
  }

  isAuthenticated(): boolean {
    return this._isAuthenticated;
  }

  getToken(): string | null {
    return this._token;
  }

  getUser(): User | null {
    return this._user;
  }

  async register(username: string, email: string, password: string): Promise<boolean> {
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, email, password })
      });

      if (!response.ok) {
        throw new Error('Registration failed');
      }

      // Check if registration was successful
      const data = await response.json();
      if (data && data.token && data.user) { // Ensure both token and user are present
        this._token = data.token;
        localStorage.setItem('authToken', this._token!);
        this._user = data.user;
        this._isAuthenticated = true;
        return true;
      } else {
        console.error('Unexpected response from registration endpoint');
        return false;
      }
    } catch (error) {
      console.error('Register error:', error);
      return false;
    }
  }

  async forgotPassword(email: string): Promise<boolean> {
    try {
      const response = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      if (!response.ok) {
        throw new Error('Forgot password request failed');
      }

      // Check if the request was successful
      const data = await response.json();
      if (data && data.token) {
        //  The forgot password endpoint might not return a user object.
        //  It might just return a token to indicate success.
        //  We don't update _user here.
        this._token = data.token;
        localStorage.setItem('authToken', this._token!);
        this._isAuthenticated = true;
        return true;
      } else {
        console.error('Unexpected response from forgot password endpoint');
        return false;
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      return false;
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<boolean> {
    try {
      const response = await fetch('/api/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token, newPassword })
      });

      if (!response.ok) {
        throw new Error('Password reset failed');
      }

      // Check if the reset was successful
      const data = await response.json();
      if (data && data.token && data.user) {  // Ensure both are present if applicable
        this._token = data.token;
        localStorage.setItem('authToken', this._token!);
        this._user = data.user;  // Update user if the endpoint returns it.
        this._isAuthenticated = true;
        return true;
      } else if (data && data.token) { // Handle cases where only token is returned
        this._token = data.token;
        localStorage.setItem('authToken', this._token!);
        this._isAuthenticated = true;
        return true;
      }
       else {
        console.error('Unexpected response from reset password endpoint');
        return false;
      }
    } catch (error) {
      console.error('Reset password error:', error);
      return false;
    }
  }
}

export default new AuthService();