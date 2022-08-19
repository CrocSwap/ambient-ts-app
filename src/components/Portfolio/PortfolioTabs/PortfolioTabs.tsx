import styles from './PortfolioTabs.module.css';
import { useEffect, useState, Dispatch, SetStateAction } from 'react';

import Wallet from '../../Global/Account/AccountTabs/Wallet/Wallet';
import Exchange from '../../Global/Account/AccountTabs/Exchange/Exchange';
import Range from '../../Global/Account/AccountTabs/Range/Range';
import Order from '../../Global/Account/AccountTabs/Order/Order';
import TransactionsTable from '../../Global/Account/AccountTabs/Transaction/TransactionsTable';
import { useAppSelector } from '../../../utils/hooks/reduxToolkit';
import { getPositionData } from '../../../App/functions/getPositionData';
import { PositionIF } from '../../../utils/interfaces/PositionIF';
import { TokenIF } from '../../../utils/interfaces/TokenIF';

import openOrdersImage from '../../../assets/images/sidebarImages/openOrders.svg';
import rangePositionsImage from '../../../assets/images/sidebarImages/rangePositions.svg';
import recentTransactionsImage from '../../../assets/images/sidebarImages/recentTransactions.svg';
import walletImage from '../../../assets/images/sidebarImages/wallet.svg';
import exchangeImage from '../../../assets/images/sidebarImages/exchange.svg';

import TabComponent from '../../Global/TabComponent/TabComponent';

// import { useAppSelector } from '../../../utils/hooks/reduxToolkit';
// import Wallet from '../../Global/Account/Wallet/Wallet';
// import Exchange from '../../Global/Account/Exchange/Exchange';
// import Range from '../../Global/Account/Range/Range';
// import Order from '../../Global/Account/Order/Order';
// import TransactionsTable from '../../Global/Account/Transaction/TransactionsTable';
interface PortfolioTabsPropsIF {
    resolvedAddress: string;
    activeAccount: string;
    connectedAccountActive: boolean;
    chainId: string;
    tokenMap: Map<string, TokenIF>;

    selectedOutsideTab: number;
    setSelectedOutsideTab: Dispatch<SetStateAction<number>>;
    outsideControl: boolean;
    setOutsideControl: Dispatch<SetStateAction<boolean>>;
    rightTabOptions: React.ReactNode;
}
export default function PortfolioTabs(props: PortfolioTabsPropsIF) {
    const { resolvedAddress, activeAccount, connectedAccountActive, chainId, tokenMap } = props;

    const graphData = useAppSelector((state) => state?.graphData);
    const connectedAccountPositionData = graphData.positionsByUser.positions;
    const [otherAccountPositionData, setOtherAccountPositionData] = useState<PositionIF[]>([]);

    const httpGraphCacheServerDomain = 'https://809821320828123.de:5000';

    const allUserPositionsCacheEndpoint = httpGraphCacheServerDomain + '/user_positions?';

    const getUserPositions = async (accountToSearch: string) =>
        fetch(
            allUserPositionsCacheEndpoint +
                new URLSearchParams({
                    user: accountToSearch,
                    chainId: chainId,
                }),
        )
            .then((response) => response?.json())
            .then((json) => {
                const userPositions = json?.data;

                if (userPositions) {
                    Promise.all(userPositions.map(getPositionData)).then((updatedPositions) => {
                        setOtherAccountPositionData(updatedPositions);
                    });
                }
            })
            .catch(console.log);

    useEffect(() => {
        (async () => {
            if (!connectedAccountActive) {
                await getUserPositions(activeAccount);
            }
        })();
    }, [activeAccount, connectedAccountActive]);

    const activeAccountPositionData = connectedAccountActive
        ? connectedAccountPositionData
        : otherAccountPositionData;

    // props for <Wallet/> React Element
    const walletProps = {
        connectedAccountActive: connectedAccountActive,
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
        { label: 'Exchange', content: <Exchange />, icon: exchangeImage },
        { label: 'Ranges', content: <Range {...rangeProps} />, icon: rangePositionsImage },
        { label: ' Orders', content: <Order />, icon: openOrdersImage },
        { label: 'Transactions', content: <TransactionsTable />, icon: recentTransactionsImage },
    ];

    return (
        <div className={styles.tabs_container}>
            <TabComponent
                data={accountTabData}
                rightTabOptions={props.rightTabOptions}
                selectedOutsideTab={props.selectedOutsideTab}
                setSelectedOutsideTab={props.setSelectedOutsideTab}
                outsideControl={props.outsideControl}
                setOutsideControl={props.setOutsideControl}
            />
        </div>
    );
}
