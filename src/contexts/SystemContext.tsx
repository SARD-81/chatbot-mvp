import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

import { getSystemById, type AppSystemConfig, type AppSystemId } from '../config/systems';
import { getActiveSystemId, setActiveSystemId } from '../utils/storage';

export type SystemContextValue = {
  activeSystem: AppSystemConfig;
  activeSystemId: AppSystemId;
  setSystem: (systemId: AppSystemId) => void;
};

const SystemContext = createContext<SystemContextValue | undefined>(undefined);

export function SystemProvider({ children }: { children: ReactNode }) {
  const [activeSystemId, setActiveSystemIdState] = useState<AppSystemId>(() => getActiveSystemId());
  const activeSystem = getSystemById(activeSystemId);

  const value = useMemo(
    () => ({
      activeSystem,
      activeSystemId,
      setSystem(systemId: AppSystemId) {
        setActiveSystemId(systemId);
        setActiveSystemIdState(systemId);
      },
    }),
    [activeSystem, activeSystemId],
  );

  return <SystemContext.Provider value={value}>{children}</SystemContext.Provider>;
}

export function useSystem() {
  const context = useContext(SystemContext);

  if (context === undefined) {
    throw new Error('useSystem must be used inside SystemProvider');
  }

  return context;
}
