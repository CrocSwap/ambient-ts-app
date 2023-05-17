import { createContext } from 'react';
import { recentPoolsMethodsIF } from '../App/hooks/useRecentPools';
import { TempPoolIF } from '../utils/interfaces/exports';
import { sidebarMethodsIF } from '../App/hooks/useSidebar';

interface SidebarStateIF {
    poolList: TempPoolIF[];
    recentPools: recentPoolsMethodsIF;
    sidebar: sidebarMethodsIF;
}

export const SidebarContext = createContext<SidebarStateIF>(
    {} as SidebarStateIF,
);
