// START: Import React and Dongles
import { useEffect, useState, Dispatch, SetStateAction, ReactNode } from 'react';

// START: Import JSX Functional Components
import Wallet from '../../Global/Account/AccountTabs/Wallet/Wallet';
import Exchange from '../../Global/Account/AccountTabs/Exchange/Exchange';
import Range from '../../Global/Account/AccountTabs/Range/Range';
import Order from '../../Global/Account/AccountTabs/Order/Order';
import TransactionsTable from '../../Global/Account/AccountTabs/Transaction/TransactionsTable';
import TabComponent from '../../Global/TabComponent/TabComponent';

// START: Import Local Files
import styles from './PortfolioTabs.module.css';
import { useAppSelector } from '../../../utils/hooks/reduxToolkit';
import { getPositionData } from '../../../App/functions/getPositionData';
import { PositionIF } from '../../../utils/interfaces/PositionIF';
import { TokenIF } from '../../../utils/interfaces/TokenIF';
import openOrdersImage from '../../../assets/images/sidebarImages/openOrders.svg';
import rangePositionsImage from '../../../assets/images/sidebarImages/rangePositions.svg';
import recentTransactionsImage from '../../../assets/images/sidebarImages/recentTransactions.svg';
import walletImage from '../../../assets/images/sidebarImages/wallet.svg';
import exchangeImage from '../../../assets/images/sidebarImages/exchange.svg';
import { CrocEnv } from '@crocswap-libs/sdk';
import { ethers } from 'ethers';

// interface for React functional component props
interface PortfolioTabsPropsIF {
    crocEnv: CrocEnv | undefined;
    provider: ethers.providers.Provider | undefined;
    importedTokens: TokenIF[];
    connectedUserTokens: (TokenIF | undefined)[];
    resolvedAddressTokens: (TokenIF | undefined)[];
    resolvedAddress: string;
    lastBlockNumber: number;
    activeAccount: string;
    connectedAccountActive: boolean;
    chainId: string;
    tokenMap: Map<string, TokenIF>;
    selectedOutsideTab: number;
    setSelectedOutsideTab: Dispatch<SetStateAction<number>>;
    outsideControl: boolean;
    setOutsideControl: Dispatch<SetStateAction<boolean>>;
    rightTabOptions: ReactNode;
}

// React functional component
export default function PortfolioTabs(props: PortfolioTabsPropsIF) {
    const {
        crocEnv,
        provider,
        importedTokens,
        connectedUserTokens,
        resolvedAddressTokens,
        resolvedAddress,
        lastBlockNumber,
        activeAccount,
        connectedAccountActive,
        chainId,
        tokenMap,
        selectedOutsideTab,
        setSelectedOutsideTab,
        rightTabOptions,
        outsideControl,
        setOutsideControl,
    } = props;

    const graphData = useAppSelector((state) => state?.graphData);
    const connectedAccountPositionData = graphData.positionsByUser.positions;
    const [otherAccountPositionData, setOtherAccountPositionData] = useState<PositionIF[]>([]);

    useEffect(() => {
        if (otherAccountPositionData) console.log({ otherAccountPositionData });
    }, [otherAccountPositionData]);

    const httpGraphCacheServerDomain = 'https://809821320828123.de:5000';

    const allUserPositionsCacheEndpoint = httpGraphCacheServerDomain + '/user_positions?';

    const getUserPositions = async (accountToSearch: string) =>
        fetch(
            allUserPositionsCacheEndpoint +
                new URLSearchParams({
                    user: accountToSearch,
                    chainId: chainId,
                    ensResolution: 'true',
                    annotate: 'true',
                    omitEmpty: 'true',
                    omitKnockout: 'true',
                    addValue: 'true',
                }),
        )
            .then((response) => response?.json())
            .then((json) => {
                const userPositions = json?.data;

                if (userPositions && provider) {
                    Promise.all(
                        userPositions.map((position: PositionIF) => {
                            return getPositionData(
                                position,
                                importedTokens,
                                provider,
                                chainId,
                                lastBlockNumber,
                            );
                        }),
                    ).then((updatedPositions) => {
                        setOtherAccountPositionData(updatedPositions);
                    });
                }
            })
            .catch(console.log);

    useEffect(() => {
        (async () => {
            if (!connectedAccountActive) {
                await getUserPositions(resolvedAddress);
            }
        })();
    }, [resolvedAddress, connectedAccountActive]);

    const activeAccountPositionData = connectedAccountActive
        ? connectedAccountPositionData
        : otherAccountPositionData;

    // props for <Wallet/> React Element
    const walletProps = {
        crocEnv: crocEnv,
        connectedUserTokens: connectedUserTokens,
        resolvedAddressTokens: resolvedAddressTokens,
        connectedAccountActive: connectedAccountActive,
        lastBlockNumber: lastBlockNumber,
        resolvedAddress: resolvedAddress,
        activeAccount: activeAccount,
        chainId: chainId,
        tokenMap: tokenMap,
    };

    // props for <Exchange/> React Element
    const exchangeProps = {
        crocEnv: crocEnv,
        connectedUserTokens: connectedUserTokens,
        resolvedAddressTokens: resolvedAddressTokens,
        connectedAccountActive: connectedAccountActive,
        lastBlockNumber: lastBlockNumber,
        resolvedAddress: resolvedAddress,
        activeAccount: activeAccount,
        chainId: chainId,
        tokenMap: tokenMap,
    };
    // props for <Range/> React Element
    const rangeProps = {
        positions: activeAccountPositionData,
    };

    const accountTabData = [
        { label: 'Wallet', content: <Wallet {...walletProps} />, icon: walletImage },
        { label: 'Exchange', content: <Exchange {...exchangeProps} />, icon: exchangeImage },
        { label: 'Ranges', content: <Range {...rangeProps} />, icon: rangePositionsImage },
        { label: 'Limit Orders', content: <Order />, icon: openOrdersImage },
        { label: 'Transactions', content: <TransactionsTable />, icon: recentTransactionsImage },
    ];

    return (
        <div className={styles.tabs_container}>
            <TabComponent
                data={accountTabData}
                rightTabOptions={rightTabOptions}
                selectedOutsideTab={selectedOutsideTab}
                setSelectedOutsideTab={setSelectedOutsideTab}
                outsideControl={outsideControl}
                setOutsideControl={setOutsideControl}
            />
        </div>
    );
}
