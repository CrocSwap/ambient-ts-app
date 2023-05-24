import { Dispatch, SetStateAction, useContext } from 'react';
import styles from '../SidebarSearchResults.module.css';
import { PositionIF } from '../../../../../utils/interfaces/exports';
import { getRangeDisplay, getValueUSD } from './functions/exports';
import { AppStateContext } from '../../../../../contexts/AppStateContext';
import { useUrlPath, linkGenMethodsIF } from '../../../../../utils/hooks/useUrlPath';

interface propsIF {
    chainId: string,
    searchedPositions: PositionIF[];
    isDenomBase: boolean;
    setCurrentPositionActive: Dispatch<SetStateAction<string>>;
    setIsShowAllEnabled: Dispatch<SetStateAction<boolean>>;
}
interface PositionLiPropsIF {
    position: PositionIF;
    isDenomBase: boolean;
    handleClick: (position: PositionIF) => void;
}

function PositionLI(props: PositionLiPropsIF) {
    const { position, isDenomBase, handleClick } = props;

    // fn to generate human-readable range output (from X to Y)
    const rangeDisplay = getRangeDisplay(position, isDenomBase);

    // fn to generate human-readable version of total position value
    const positionValue = getValueUSD(position.totalValueUSD);

    return (
        <li
            className={styles.card_container}
            onClick={() => handleClick(position)}
        >
            <p>
                {isDenomBase
                    ? `${position?.baseSymbol} / ${position?.quoteSymbol}`
                    : `${position?.quoteSymbol} / ${position?.baseSymbol}`}
            </p>
            <p style={{ textAlign: 'center' }}>{rangeDisplay}</p>
            <p style={{ textAlign: 'center' }}>{'$' + positionValue}</p>
        </li>
    );
}

export default function PositionsSearchResults(props: propsIF) {
    const {
        chainId,
        searchedPositions,
        isDenomBase,
        setCurrentPositionActive,
        setIsShowAllEnabled,
    } = props;

    const {
        outsideControl: { setIsActive: setOutsideControlActive },
        outsideTab: { setSelected: setOutsideTabSelected },
    } = useContext(AppStateContext);

    const linkGenRange: linkGenMethodsIF = useUrlPath('range');

    const handleClick = (position: PositionIF): void => {
        setOutsideControlActive(true);
        setOutsideTabSelected(2);
        setCurrentPositionActive(position.positionStorageSlot);
        setIsShowAllEnabled(false);
        linkGenRange.navigate({
            chain: chainId,
            tokenA: position.base,
            tokenB: position.quote
        });
    };

    return (
        <div>
            <div className={styles.card_title}>My Range Positions</div>
            {searchedPositions.length ? (
                <>
                    <header className={styles.header}>
                        <div>Pool</div>
                        <div>Range</div>
                        <div>Value</div>
                    </header>
                    <ol className={styles.main_result_container}>
                        {searchedPositions
                            .slice(0, 4)
                            .map((position: PositionIF) => (
                                <PositionLI
                                    key={`PositionSearchResult_${JSON.stringify(
                                        position,
                                    )}`}
                                    position={position}
                                    isDenomBase={isDenomBase}
                                    handleClick={handleClick}
                                />
                            ))}
                    </ol>
                </>
            ) : (
                <h5 className={styles.not_found_text}>No Ranges Found</h5>
            )}
        </div>
    );
}
