import React, { createContext, useContext } from 'react';
import { fetchXpLeadersData } from '../ambient-utils/api';
import {
    XpLeaderboardDataIF,
    XpLeadersDataIF,
} from '../ambient-utils/types/contextTypes';
import { AppStateContext } from './AppStateContext';

interface XpLeadersContextIF {
    xpLeaders: XpLeadersDataIF;
}

export const XpLeadersContext = createContext({} as XpLeadersContextIF);

export const XpLeadersContextProvider = (props: {
    children: React.ReactNode;
}) => {
    const {
        activeNetwork: { chainId },
    } = useContext(AppStateContext);

    const [xpLeadersGlobal, setXpLeadersGlobal] =
        React.useState<XpLeaderboardDataIF>({
            dataReceived: false,
            data: undefined,
        });
    const [xpLeadersByWeek, setXpLeadersByWeek] =
        React.useState<XpLeaderboardDataIF>({
            dataReceived: false,
            data: undefined,
        });
    const [xpLeadersByChain, setXpLeadersByChain] =
        React.useState<XpLeaderboardDataIF>({
            dataReceived: false,
            data: undefined,
        });

    function getXpLeaders(xpLeaderboardType: string) {
        switch (xpLeaderboardType) {
            case 'Weekly':
                fetchXpLeadersData('byWeek').then((data) => {
                    setXpLeadersByWeek({
                        dataReceived: true,
                        data: data,
                    });
                });
                break;
            case 'Chain':
                fetchXpLeadersData('byChain', chainId).then((data) => {
                    setXpLeadersByChain({
                        dataReceived: true,
                        data: data,
                    });
                });
                break;
            default:
                fetchXpLeadersData('global').then((data) => {
                    setXpLeadersGlobal({
                        dataReceived: true,
                        data: data,
                    });
                });
                break;
        }
    }

    const xpLeadersContext: XpLeadersContextIF = {
        xpLeaders: {
            global: xpLeadersGlobal,
            getXpLeaders: getXpLeaders,
            byWeek: xpLeadersByWeek,
            byChain: xpLeadersByChain,
        },
    };

    return (
        <XpLeadersContext.Provider value={xpLeadersContext}>
            {props.children}
        </XpLeadersContext.Provider>
    );
};
