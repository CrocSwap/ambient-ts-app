import { Dispatch, SetStateAction, useContext } from 'react';
import styles from '../SidebarSearchResults.module.css';
import { LimitOrderIF } from '../../../../../utils/interfaces/exports';
import getUnicodeCharacter from '../../../../../utils/functions/getUnicodeCharacter';
import { getDisplayPrice, getValueUSD } from './functions/exports';
import { AppStateContext } from '../../../../../contexts/AppStateContext';
import { useUrlPath, linkGenMethodsIF } from '../../../../../utils/hooks/useUrlPath';

interface propsIF {
    chainId: string;
    searchedLimitOrders: LimitOrderIF[];
    isDenomBase: boolean;
    setCurrentPositionActive: Dispatch<SetStateAction<string>>;
    setIsShowAllEnabled: Dispatch<SetStateAction<boolean>>;
}
interface limitOrderPropsIF {
    limitOrder: LimitOrderIF;
    isDenomBase: boolean;
    handleClick: (limitOrder: LimitOrderIF) => void;
}

function LimitOrderLI(props: limitOrderPropsIF) {
    const { limitOrder, isDenomBase, handleClick } = props;

    const symbols = {
        base: limitOrder.baseSymbol
            ? getUnicodeCharacter(limitOrder.baseSymbol)
            : '',
        quote: limitOrder.quoteSymbol
            ? getUnicodeCharacter(limitOrder.quoteSymbol)
            : '',
    };

    const displayPrice = isDenomBase
        ? getDisplayPrice(
              symbols.quote,
              limitOrder.invLimitPriceDecimalCorrected,
          )
        : getDisplayPrice(symbols.base, limitOrder.limitPriceDecimalCorrected);

    const valueUSD = getValueUSD(limitOrder.totalValueUSD);

    return (
        <li
            className={styles.card_container}
            onClick={() => handleClick(limitOrder)}
        >
            <p>
                {limitOrder.baseSymbol} / {limitOrder.quoteSymbol}
            </p>
            <p style={{ textAlign: 'center' }}>{displayPrice}</p>
            <p style={{ textAlign: 'center' }}>{valueUSD}</p>
        </li>
    );
}

export default function OrdersSearchResults(props: propsIF) {
    const {
        chainId,
        searchedLimitOrders,
        isDenomBase,
        setCurrentPositionActive,
        setIsShowAllEnabled,
    } = props;

    const {
        outsideControl: { setIsActive: setOutsideControlActive },
        outsideTab: { setSelected: setOutsideTabSelected },
    } = useContext(AppStateContext);

    const linkGenLimit: linkGenMethodsIF = useUrlPath('limit');

    const handleClick = (limitOrder: LimitOrderIF): void => {
        setOutsideControlActive(true);
        setOutsideTabSelected(1);
        setCurrentPositionActive(limitOrder.limitOrderIdentifier);
        setIsShowAllEnabled(false);
        linkGenLimit.navigate({
            chain: chainId,
            tokenA: limitOrder.base,
            tokenB: limitOrder.quote
        });
    };

    return (
        <div>
            <h6 className={styles.card_title}>My Limit Orders</h6>
            {searchedLimitOrders.length ? (
                <>
                    <header className={styles.header}>
                        <div>Pool</div>
                        <div>Price</div>
                        <div>Value</div>
                    </header>
                    <ol className={styles.main_result_container}>
                        {searchedLimitOrders
                            .slice(0, 4)
                            .map((limitOrder: LimitOrderIF) => (
                                <LimitOrderLI
                                    key={`order-search-result-${JSON.stringify(
                                        limitOrder,
                                    )}`}
                                    limitOrder={limitOrder}
                                    isDenomBase={isDenomBase}
                                    handleClick={handleClick}
                                />
                            ))}
                    </ol>
                </>
            ) : (
                <h5 className={styles.not_found_text}>No Orders Found</h5>
            )}
        </div>
    );
}
