import { Dispatch, SetStateAction } from 'react';
import styles from '../SidebarSearchResults.module.css';
import { PositionIF } from '../../../../../utils/interfaces/exports';
import PositionLI from './PositionLI';
import { useClick } from './hooks/useClick';

interface propsIF {
    searchedPositions: PositionIF[];
    isDenomBase: boolean;
    setOutsideControl: Dispatch<SetStateAction<boolean>>;
    setSelectedOutsideTab: Dispatch<SetStateAction<number>>;
    setCurrentPositionActive: Dispatch<SetStateAction<string>>;
    setIsShowAllEnabled: Dispatch<SetStateAction<boolean>>;
}

export default function PositionsSearchResults(props: propsIF) {
    const {
        searchedPositions,
        isDenomBase,
        setOutsideControl,
        setSelectedOutsideTab,
        setCurrentPositionActive,
        setIsShowAllEnabled,
    } = props;

    const handleClick = useClick(
        setOutsideControl,
        setSelectedOutsideTab,
        setCurrentPositionActive,
        setIsShowAllEnabled,
    );

    return (
        <div>
            <div className={styles.card_title}>My Range Positions</div>
            <div className={styles.header}>
                <div>Pool</div>
                <div>Range</div>
                <div>Value</div>
            </div>
            <div className={styles.main_result_container}>
                {searchedPositions.slice(0, 4).map((position: PositionIF) => (
                    <PositionLI
                        key={`PositionSearchResult_${JSON.stringify(position)}`}
                        position={position}
                        isDenomBase={isDenomBase}
                        handleClick={handleClick}
                    />
                ))}
            </div>
        </div>
    );
}
