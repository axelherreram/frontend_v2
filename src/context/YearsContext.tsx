import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { getYears } from '../ts/General/GetYears';

interface Year {
  year_id: number;
  year: number;
}

interface YearsContextType {
  years: Year[];
  loading: boolean;
  error: string | null;
  reloadYears: () => Promise<void>;
}

const YearsContext = createContext<YearsContextType | undefined>(undefined);

export const YearsProvider = ({ children }: { children: ReactNode }) => {
  const [years, setYears] = useState<Year[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const reloadYears = useCallback(async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      setYears([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const data = await getYears();
      setYears(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar los años');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reloadYears();
  }, [reloadYears]);

  return (
    <YearsContext.Provider value={{ years, loading, error, reloadYears }}>
      {children}
    </YearsContext.Provider>
  );
};

/**
 * Hook to access available academic years globally.
 * Replaces individual getYears() calls in each component.
 *
 * @example
 * const { years } = useYears();
 * const yearNumbers = years.map(y => y.year);
 */
export const useYears = (): YearsContextType => {
  const context = useContext(YearsContext);
  if (!context) {
    throw new Error('useYears must be used within a YearsProvider');
  }
  return context;
};
