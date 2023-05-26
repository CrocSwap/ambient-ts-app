import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../SidebarSearchResults.module.css';
import { LimitOrderIF } from '../../../../../utils/interfaces/exports';
import getUnicodeCharacter from '../../../../../utils/functions/getUnicodeCharacter';
import { getDisplayPrice, getValueUSD } from './functions/exports';
import { CrocEnvContext } from '../../../../../contexts/CrocEnvContext';
import { TradeTableContext } from '../../../../../contexts/TradeTableContext';
import { useAppSelector } from '../../../../../utils/hooks/reduxToolkit';

interface propsIF {
    searchedLimitOrders: LimitOrderIF[];
}
interface limitOrderPropsIF {
    limitOrder: LimitOrderIF;
    handleClick: (limitOrder: LimitOrderIF) => void;
}

function LimitOrderLI(props: limitOrderPropsIF) {
    const { limitOrder, handleClick } = props;
    const { isDenomBase } = useAppSelector((state) => state.tradeData);

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
    const { searchedLimitOrders } = props;

    const {
        chainData: { chainId },
    } = useContext(CrocEnvContext);
    const {
        setCurrentPositionActive,
        setShowAllData,
        outsideControl: { setIsActive: setOutsideControlActive },
        outsideTab: { setSelected: setOutsideTabSelected },
    } = useContext(TradeTableContext);

    const navigate = useNavigate();

    const handleClick = (limitOrder: LimitOrderIF): void => {
        setOutsideControlActive(true);
        setOutsideTabSelected(1);
        setCurrentPositionActive(limitOrder.limitOrderIdentifier);
        setShowAllData(false);
        navigate(
            '/trade/limit/chain=' +
                chainId +
                '&tokenA=' +
                limitOrder.base +
                '&tokenB=' +
                limitOrder.quote,
        );
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
