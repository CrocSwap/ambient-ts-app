import { PositionIF } from '../../../../../utils/interfaces/exports';
import { CrocEnvContext } from '../../../../../contexts/CrocEnvContext';
import { TradeTableContext } from '../../../../../contexts/TradeTableContext';
import { useAppSelector } from '../../../../../utils/hooks/reduxToolkit';
import { useContext } from 'react';
import styles from '../SidebarSearchResults.module.css';
import { getRangeDisplay } from './functions/exports';
import {
    useLinkGen,
    linkGenMethodsIF,
} from '../../../../../utils/hooks/useLinkGen';
import { getFormattedNumber } from '../../../../functions/getFormattedNumber';

interface propsIF {
    searchedPositions: PositionIF[];
}
interface PositionLiPropsIF {
    position: PositionIF;
    handleClick: (position: PositionIF) => void;
}

function PositionLI(props: PositionLiPropsIF) {
    const { position, handleClick } = props;
    const { isDenomBase } = useAppSelector((state) => state.tradeData);

    // fn to generate human-readable range output (from X to Y)
    const rangeDisplay = getRangeDisplay(position, isDenomBase);

    // fn to generate human-readable version of total position value
    const positionValue = getFormattedNumber({
        value: position.totalValueUSD,
    });

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
    const { searchedPositions } = props;

    const {
        chainData: { chainId },
    } = useContext(CrocEnvContext);
    const {
        setCurrentPositionActive,
        setShowAllData,
        setOutsideControl,
        setSelectedOutsideTab,
    } = useContext(TradeTableContext);

    // hook to generate navigation actions with pre-loaded path
    const linkGenPool: linkGenMethodsIF = useLinkGen('pool');

    const handleClick = (position: PositionIF): void => {
        setOutsideControl(true);
        setSelectedOutsideTab(2);
        setCurrentPositionActive(position.lastMintTx);
        setShowAllData(false);
        linkGenPool.navigate({
            chain: chainId,
            tokenA: position.base,
            tokenB: position.quote,
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
