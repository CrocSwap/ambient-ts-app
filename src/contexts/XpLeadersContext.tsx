import React, { createContext } from 'react';
import { UserXpIF } from '../ambient-utils/types';
import { fetchXpLeadersData } from '../ambient-utils/api';

interface XpLeadersContextIF {
    xpLeadersData: XpLeadersDataIF;
}

export interface XpLeadersDataIF {
    dataReceived: boolean;
    data: Array<UserXpIF> | undefined;
}

export const XpLeadersContext = createContext<XpLeadersContextIF>(
    {} as XpLeadersContextIF,
);

export const XpLeadersContextProvider = (props: {
    children: React.ReactNode;
}) => {
    const [xpLeaders, setXpLeaders] = React.useState<XpLeadersDataIF>({
        dataReceived: false,
        data: undefined,
    });

    React.useEffect(() => {
        fetchXpLeadersData().then((data) => {
            setXpLeaders({
                dataReceived: true,
                data: data,
            });
        });
    }, []);

    const xpLeadersContext: XpLeadersContextIF = {
        xpLeadersData: xpLeaders,
    };

    return (
        <XpLeadersContext.Provider value={xpLeadersContext}>
            {props.children}
        </XpLeadersContext.Provider>
    );
};
