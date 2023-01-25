import styles from '../SidebarSearchResults.module.css';
import { PositionIF } from '../../../../../utils/interfaces/PositionIF';
import PositionLI from './PositionLI';

interface propsIF {
    searchInput: React.ReactNode;
    positionsByUser: PositionIF[];
    isDenomBase: boolean;
}

export default function PositionsSearchResults(props: propsIF) {
    const { searchInput, positionsByUser, isDenomBase } = props;
    false && searchInput;

    return (
        <div>
            <div className={styles.card_title}>My Range Positions</div>
            <div className={styles.header}>
                <div>Pool</div>
                <div>Range</div>
                <div>Value</div>
            </div>
            <div className={styles.main_result_container}>
                {positionsByUser.slice(0,4).map((position: PositionIF) => (
                    <PositionLI
                        key={`PositionSearchResult_${JSON.stringify(position)}`}
                        position={position}
                        isDenomBase={isDenomBase}
                    />
                ))}
            </div>
        </div>
    );
}
