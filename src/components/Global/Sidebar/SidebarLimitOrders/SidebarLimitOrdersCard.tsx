import styles from './SidebarLimitOrdersCard.module.css';
import { SetStateAction, Dispatch, useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LimitOrderIF, TokenIF } from '../../../../utils/interfaces/exports';
// import { useAppDispatch } from '../../../../utils/hooks/reduxToolkit';
// import { setTokenA, setTokenB } from '../../../../utils/state/tradeDataSlice';
import getUnicodeCharacter from '../../../../utils/functions/getUnicodeCharacter';
import { formatAmount } from '../../../../utils/numbers';

interface SidebarLimitOrdersCardProps {
    isDenomBase: boolean;
    tokenMap: Map<string, TokenIF>;
    order: LimitOrderIF;
    selectedOutsideTab: number;
    setSelectedOutsideTab: Dispatch<SetStateAction<number>>;
    outsideControl: boolean;
    setCurrentPositionActive: Dispatch<SetStateAction<string>>;
    setIsShowAllEnabled: Dispatch<SetStateAction<boolean>>;
    setOutsideControl: Dispatch<SetStateAction<boolean>>;
}
export default function SidebarLimitOrdersCard(props: SidebarLimitOrdersCardProps) {
    // const location = useLocation();

    const {
        tokenMap,
        order,
        setIsShowAllEnabled,
        setOutsideControl,
        setCurrentPositionActive,
        setSelectedOutsideTab,
        isDenomBase,
    } = props;

    if (order.positionLiq === '0') return null;

    const baseId = order.base + '_' + order.chainId;
    const quoteId = order.quote + '_' + order.chainId;

    const baseToken = tokenMap ? tokenMap.get(baseId.toLowerCase()) : null;
    const quoteToken = tokenMap ? tokenMap.get(quoteId.toLowerCase()) : null;

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

    // const liqTotalUSD =
    //     order.positionLiqTotalUSD !== undefined
    //         ? '$' +
    //           order.positionLiqTotalUSD?.toLocaleString(undefined, {
    //               minimumFractionDigits: 2,
    //               maximumFractionDigits: 2,
    //           })
    //         : '…';

    const usdValueNum = order.totalValueUSD;
    const usdValueTruncated = !usdValueNum
        ? undefined
        : usdValueNum < 0.0001
        ? usdValueNum.toExponential(2)
        : usdValueNum < 2
        ? usdValueNum.toPrecision(3)
        : usdValueNum >= 10000
        ? formatAmount(usdValueNum, 1)
        : // ? baseLiqDisplayNum.toExponential(2)
          usdValueNum.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
          });

    const { pathname } = useLocation();

    const linkPath = useMemo(() => {
        let locationSlug = '';
        if (pathname.startsWith('/trade/market') || pathname.startsWith('/account')) {
            locationSlug = '/trade/market';
        } else if (pathname.startsWith('/trade/limit')) {
            locationSlug = '/trade/limit';
        } else if (pathname.startsWith('/trade/range')) {
            locationSlug = '/trade/range';
        } else if (pathname.startsWith('/swap')) {
            locationSlug = '/swap';
        }
        return locationSlug + '/chain=0x5&tokenA=' + order.base + '&tokenB=' + order.quote;
    }, [pathname]);

    const navigate = useNavigate();

    function handleLimitOrderClick() {
        setOutsideControl(true);
        setSelectedOutsideTab(1);
        setCurrentPositionActive(order.limitOrderIdentifier);
        setIsShowAllEnabled(false);
        navigate(linkPath);
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
                {usdValueTruncated ? '$' + usdValueTruncated : '…'}
            </div>
        </div>
    );
}
