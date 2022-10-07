import styles from './SidebarLimitOrdersCard.module.css';
import { SetStateAction, Dispatch, useState, useEffect } from 'react';
import {
    // useLocation,
    useNavigate
} from 'react-router-dom';
import { ILimitOrderState } from '../../../../utils/state/graphDataSlice';
import { TokenIF } from '../../../../utils/interfaces/TokenIF';
// import { useAppDispatch } from '../../../../utils/hooks/reduxToolkit';
// import { setTokenA, setTokenB } from '../../../../utils/state/tradeDataSlice';
import getUnicodeCharacter from '../../../../utils/functions/getUnicodeCharacter';

interface SidebarLimitOrdersCardProps {
    isDenomBase: boolean;
    tokenMap: Map<string, TokenIF>;
    order: ILimitOrderState;
    selectedOutsideTab: number;
    setSelectedOutsideTab: Dispatch<SetStateAction<number>>;
    outsideControl: boolean;
    setOutsideControl: Dispatch<SetStateAction<boolean>>;
}
export default function SidebarLimitOrdersCard(props: SidebarLimitOrdersCardProps) {
    const {
        tokenMap,
        order,
        // setOutsideControl,
        // setSelectedOutsideTab,
        isDenomBase
    } = props;

    const navigate = useNavigate();

    if (order.positionLiq === 0) return null;


    const baseId = order.base + '_' + order.chainId;
    const quoteId = order.quote + '_' + order.chainId;

    const baseToken = tokenMap ? tokenMap.get(baseId.toLowerCase()) : null;
    const quoteToken = tokenMap ? tokenMap.get(quoteId.toLowerCase()) : null;

    // const location = useLocation();
    // const dispatch = useAppDispatch();
    // const onTradeRoute = location.pathname.includes('trade');
    // const onAccountRoute = location.pathname.includes('account');
    // const tabToSwitchToBasedOnRoute = onTradeRoute ? 1 : onAccountRoute ? 3 : 0;

    const [priceDisplay, setPriceDisplay] = useState<string | undefined>(undefined);

    const baseTokenCharacter = baseToken?.symbol ? getUnicodeCharacter(baseToken?.symbol) : '';
    const quoteTokenCharacter = quoteToken?.symbol ? getUnicodeCharacter(quoteToken?.symbol) : '';

    useEffect(() => {
        if (isDenomBase) {
            const nonTruncatedPrice = order.invLimitPriceDecimalCorrected;
            const truncatedPrice =
                nonTruncatedPrice < 2
                    ? nonTruncatedPrice.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 6,
                      })
                    : nonTruncatedPrice.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                      });
            setPriceDisplay(quoteTokenCharacter + truncatedPrice);
        } else {
            const nonTruncatedPrice = order.limitPriceDecimalCorrected;
            const truncatedPrice =
                nonTruncatedPrice < 2
                    ? nonTruncatedPrice.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 6,
                      })
                    : nonTruncatedPrice.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                      });
            setPriceDisplay(baseTokenCharacter + truncatedPrice);
        }
    }, [JSON.stringify(order), isDenomBase]);

    const liqTotalUSD =
        order.positionLiqTotalUSD !== undefined
            ? '$' +
              order.positionLiqTotalUSD?.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
              })
            : '…';

    function handleLimitOrderClick() {
        // PLEASE SAVE DISABLED CODE -Emily
        // setOutsideControl(true);
        // setSelectedOutsideTab(tabToSwitchToBasedOnRoute);
        // if (baseToken) dispatch(setTokenA(baseToken));
        // if (quoteToken) dispatch(setTokenB(quoteToken));
        navigate(
            '/trade/limit/chain=0x5&tokenA=' +
            baseToken?.address +
            '&tokenB=' +
            quoteToken?.address
        );
    }

    return (
        <div className={styles.container} onClick={handleLimitOrderClick}>
            <div>
                {isDenomBase
                    ? `${order?.baseSymbol}/${order?.quoteSymbol}`
                    : `${order?.quoteSymbol}/${order?.baseSymbol}`}
            </div>
            <div>{priceDisplay}</div>
            <div className={styles.status_display}>
                {liqTotalUSD}
            </div>
        </div>
    );
}
