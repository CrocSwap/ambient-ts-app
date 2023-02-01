import { Dispatch, SetStateAction } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../SidebarSearchResults.module.css';
import { PositionIF } from '../../../../../utils/interfaces/exports';
import PositionLI from './PositionLI';

interface propsIF {
    chainId: string;
    searchedPositions: PositionIF[];
    isDenomBase: boolean;
    setOutsideControl: Dispatch<SetStateAction<boolean>>;
    setSelectedOutsideTab: Dispatch<SetStateAction<number>>;
    setCurrentPositionActive: Dispatch<SetStateAction<string>>;
    setIsShowAllEnabled: Dispatch<SetStateAction<boolean>>;
}

export default function PositionsSearchResults(props: propsIF) {
    const {
        chainId,
        searchedPositions,
        isDenomBase,
        setOutsideControl,
        setSelectedOutsideTab,
        setCurrentPositionActive,
        setIsShowAllEnabled,
    } = props;

    const navigate = useNavigate();

    const handleClick = (position: PositionIF): void => {
        setOutsideControl(true);
        setSelectedOutsideTab(2);
        setCurrentPositionActive(position.positionStorageSlot);
        setIsShowAllEnabled(false);
        navigate(
            '/trade/range/chain=' +
            chainId +
            '&tokenA=' +
            position.base +
            '&tokenB=' +
            position.quote
        );
    }

    return (
        <div>
            <div className={styles.card_title}>My Range Positions</div>
            {searchedPositions.length ? (
                <>
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
                </>
            ) : (
                <h5 className={styles.not_found_text}>No Ranges Found</h5>
            )}
        </div>
    );
}
