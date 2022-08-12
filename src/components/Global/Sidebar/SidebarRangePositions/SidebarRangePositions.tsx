import styles from './SidebarRangePositions.module.css';
import SidebarRangePositionsCard from './SidebarRangePositionsCard';
import { PositionIF } from '../../../../utils/interfaces/PositionIF';

interface SidebarRangeProps {
    isDenomBase: boolean;
    mostRecentPositions?: PositionIF[];
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
                        />
                    ))}
            </div>
        </div>
    );
}
