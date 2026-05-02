import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { getDatosPerfil, type PerfilData } from '../ts/General/GetProfileData';


interface UserProfileContextType {
  profile: PerfilData | null;
  loading: boolean;
  error: string | null;
  reloadProfile: () => Promise<void>;
}

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined);

export const UserProfileProvider = ({ children }: { children: ReactNode }) => {
  const [profile, setProfile] = useState<PerfilData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const reloadProfile = useCallback(async () => {
    // Only fetch if user is logged in
    const token = localStorage.getItem('authToken');
    if (!token) {
      setProfile(null);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const data = await getDatosPerfil();
      setProfile(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar el perfil');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reloadProfile();
  }, [reloadProfile]);

  return (
    <UserProfileContext.Provider value={{ profile, loading, error, reloadProfile }}>
      {children}
    </UserProfileContext.Provider>
  );
};

/**
 * Hook to access the authenticated user's profile globally.
 * Replaces individual getDatosPerfil() calls in each component.
 *
 * @example
 * const { profile } = useProfile();
 * const sedeId = profile?.sede;
 */
export const useProfile = (): UserProfileContextType => {
  const context = useContext(UserProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within a UserProfileProvider');
  }
  return context;
};
