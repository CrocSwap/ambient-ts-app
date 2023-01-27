import { Dispatch, SetStateAction } from 'react';
import styles from '../SidebarSearchResults.module.css';
import { PositionIF } from '../../../../../utils/interfaces/PositionIF';
import PositionLI from './PositionLI';

interface propsIF {
    searchInput: React.ReactNode;
    searchedPositions: PositionIF[];
    isDenomBase: boolean;
    setOutsideControl: Dispatch<SetStateAction<boolean>>;
    setSelectedOutsideTab: Dispatch<SetStateAction<number>>;
    setCurrentPositionActive: Dispatch<SetStateAction<string>>;
    setIsShowAllEnabled: Dispatch<SetStateAction<boolean>>;
}

export default function PositionsSearchResults(props: propsIF) {
    const {
        searchInput,
        searchedPositions,
        isDenomBase,
        setOutsideControl,
        setSelectedOutsideTab,
        setCurrentPositionActive,
        setIsShowAllEnabled,
    } = props;
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
                {searchedPositions.slice(0,4).map((position: PositionIF) => (
                    <PositionLI
                        key={`PositionSearchResult_${JSON.stringify(position)}`}
                        position={position}
                        isDenomBase={isDenomBase}
                        setOutsideControl={setOutsideControl}
                        setSelectedOutsideTab={setSelectedOutsideTab}
                        setCurrentPositionActive={setCurrentPositionActive}
                        setIsShowAllEnabled={setIsShowAllEnabled}
                    />
                ))}
            </div>
        </div>
    );
}
