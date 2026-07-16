import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  _id: string;
  email: string;
  role: 'admin' | 'teacher' | 'student';
  profileId?: string;
  token: string;
}

interface AuthContextType {
  user: User | null;
  enrolledCount: number;
  login: (userData: User) => void;
  logout: () => void;
  refreshEnrollment: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [enrolledCount, setEnrolledCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const refreshEnrollment = async () => {
    const currentProfileId = user?.profileId;
    if (!currentProfileId) return;
    try {
      const res = await fetch(`http://127.0.0.1:5000/api/students/${currentProfileId}`);
      if (res.ok) {
        const data = await res.json();
        setEnrolledCount(data.enrolledCourses ? data.enrolledCourses.length : 0);
      }
    } catch (err) {
      console.error('Error refreshing enrollment count:', err);
    }
  };

  useEffect(() => {
    const loadStoredUser = async () => {
      // Check if user is logged in
      const storedUser = localStorage.getItem('glosmart_user');
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
        if (parsed.role === 'student' && parsed.profileId) {
          try {
            const res = await fetch(`http://127.0.0.1:5000/api/students/${parsed.profileId}`);
            if (res.ok) {
              const data = await res.json();
              setEnrolledCount(data.enrolledCourses ? data.enrolledCourses.length : 0);
            }
          } catch (e) {
            console.error('Error fetching enrollment details on mount:', e);
          }
        }
      }
      setLoading(false);
    };
    loadStoredUser();
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('glosmart_user', JSON.stringify(userData));
    if (userData.role === 'student' && userData.profileId) {
      fetch(`http://127.0.0.1:5000/api/students/${userData.profileId}`)
        .then(res => res.json())
        .then(data => {
          setEnrolledCount(data.enrolledCourses ? data.enrolledCourses.length : 0);
        })
        .catch(err => console.error('Error loading enrollment on login:', err));
    } else {
      setEnrolledCount(0);
    }
  };

  const logout = () => {
    setUser(null);
    setEnrolledCount(0);
    localStorage.removeItem('glosmart_user');
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50">Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, enrolledCount, login, logout, refreshEnrollment }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
