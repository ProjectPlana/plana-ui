'use client';

import { createContext, useContext, ReactNode } from 'react';
import { GuildData } from '@/lib/sdk';
import { useGuildDataQuery } from '@/lib/queries';

interface GuildContextType {
  guildData: GuildData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const GuildContext = createContext<GuildContextType | undefined>(undefined);

interface GuildProviderProps {
  children: ReactNode;
  guildId: string;
}

export function GuildProvider({ children, guildId }: GuildProviderProps) {
  const guildDataQuery = useGuildDataQuery(guildId);

  const value = {
    guildData: guildDataQuery.data ?? null,
    loading: guildDataQuery.isLoading,
    error: guildDataQuery.error ? 'Failed to load guild data' : null,
    refetch: async () => {
      await guildDataQuery.refetch();
    }
  };

  return (
    <GuildContext.Provider value={value}>
      {children}
    </GuildContext.Provider>
  );
}

export function useGuild() {
  const context = useContext(GuildContext);
  if (context === undefined) {
    throw new Error('useGuild must be used within a GuildProvider');
  }
  return context;
} 
