// Simple authentication utilities
// In a real app, you'd want to use proper JWT tokens and secure storage

export interface User {
  email: string;
  name?: string;
}

const AUTH_KEY = 'auth_user';

export function login(email: string, password: string): Promise<User> {
  return new Promise((resolve, reject) => {
    // Simple mock authentication - replace with real API call
    setTimeout(() => {
      if (email && password) {
        const user: User = { email, name: email.split('@')[0] };
        localStorage.setItem(AUTH_KEY, JSON.stringify(user));
        resolve(user);
      } else {
        reject(new Error('Invalid credentials'));
      }
    }, 500);
  });
}

export function logout(): void {
  localStorage.removeItem(AUTH_KEY);
}

export function getCurrentUser(): User | null {
  try {
    const stored = localStorage.getItem(AUTH_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  return getCurrentUser() !== null;
}
