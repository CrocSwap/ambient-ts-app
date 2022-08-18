import styles from './SidebarRangePositions.module.css';
import SidebarRangePositionsCard from './SidebarRangePositionsCard';
import { PositionIF } from '../../../../utils/interfaces/PositionIF';
import { SetStateAction, Dispatch } from 'react';

interface SidebarRangeProps {
    isDenomBase: boolean;
    mostRecentPositions?: PositionIF[];
    selectedOutsideTab: number;
    setSelectedOutsideTab: Dispatch<SetStateAction<number>>;
    outsideControl: boolean;
    setOutsideControl: Dispatch<SetStateAction<boolean>>;
}

export default function SidebarRangePositions(props: SidebarRangeProps) {
    const { isDenomBase, mostRecentPositions } = props;

    const header = (
        <div className={styles.header}>
            <div>Pool</div>
            <div>Range</div>
            <div>Amount</div>
        </div>
    );

    const sidebarRangePositionCardProps = {
        selectedOutsideTab: props.selectedOutsideTab,
        setSelectedOutsideTab: props.setSelectedOutsideTab,
        outsideControl: props.outsideControl,
        setOutsideControl: props.setOutsideControl,
    };
    // const mapItems = [1, 2, 3, 4, 5, 6, 7];
    return (
        <div className={styles.container}>
            {header}
            <div className={styles.content}>
                {mostRecentPositions &&
                    mostRecentPositions.map((position, idx) => (
                        <SidebarRangePositionsCard
                            key={idx}
                            position={position}
                            isDenomBase={isDenomBase}
                            {...sidebarRangePositionCardProps}
                        />
                    ))}
            </div>
        </div>
    );
}
