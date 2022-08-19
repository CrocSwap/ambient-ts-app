import styles from './SidebarLimitOrders.module.css';
import SidebarLimitOrdersCard from './SidebarLimitOrdersCard';
import { SetStateAction, Dispatch } from 'react';

interface SidebarLimitOrdersProps {
    selectedOutsideTab: number;
    setSelectedOutsideTab: Dispatch<SetStateAction<number>>;
    outsideControl: boolean;
    setOutsideControl: Dispatch<SetStateAction<boolean>>;
}
export default function SidebarLimitOrders(props: SidebarLimitOrdersProps) {
    const header = (
        <div className={styles.header}>
            <div>Pool</div>
            <div>Price</div>
            <div>Amount</div>
        </div>
    );

    const mapItems = [1, 2, 3, 4, 5, 6, 7];

    const sidebarLimitOrderCardProps = {
        selectedOutsideTab: props.selectedOutsideTab,
        setSelectedOutsideTab: props.setSelectedOutsideTab,
        outsideControl: props.outsideControl,
        setOutsideControl: props.setOutsideControl,
    };
    return (
        <div className={styles.container}>
            {header}
            <div className={styles.content}>
                {mapItems.map((item, idx) => (
                    <SidebarLimitOrdersCard key={idx} {...sidebarLimitOrderCardProps} />
                ))}
            </div>
        </div>
    );
}
