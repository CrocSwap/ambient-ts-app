import styles from './SidebarLimitOrdersCard.module.css';
import { SetStateAction, Dispatch } from 'react';
import { useLocation } from 'react-router-dom';

interface SidebarLimitOrdersCardProps {
    selectedOutsideTab: number;
    setSelectedOutsideTab: Dispatch<SetStateAction<number>>;
    outsideControl: boolean;
    setOutsideControl: Dispatch<SetStateAction<boolean>>;
}
export default function SidebarLimitOrdersCard(props: SidebarLimitOrdersCardProps) {
    const location = useLocation();

    const { setOutsideControl, setSelectedOutsideTab } = props;
    const onTradeRoute = location.pathname.includes('trade');
    const onAccountRoute = location.pathname.includes('account');

    const tabToSwitchToBasedOnRoute = onTradeRoute ? 1 : onAccountRoute ? 3 : 0;

    const tokenDisplay = (
        <div className={styles.token_container}>
            <img
                src='https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Ethereum-icon-purple.svg/2048px-Ethereum-icon-purple.svg.png'
                alt='token image'
            />
        </div>
    );

    function handleLimitOrderClick() {
        setOutsideControl(true);
        setSelectedOutsideTab(tabToSwitchToBasedOnRoute);
    }

    return (
        <div className={styles.container} onClick={handleLimitOrderClick}>
            <div>Pool</div>
            <div>Price</div>
            <div className={styles.status_display}>
                Amount
                {tokenDisplay}
            </div>
        </div>
    );
}
