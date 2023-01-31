import styles from './SidebarLimitOrdersCard.module.css';
import { SetStateAction, Dispatch, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LimitOrderIF, TokenIF } from '../../../../utils/interfaces/exports';
import getUnicodeCharacter from '../../../../utils/functions/getUnicodeCharacter';
import { formatAmountOld } from '../../../../utils/numbers';

interface propsIF {
    isDenomBase: boolean;
    tokenMap: Map<string, TokenIF>;
    chainId: string;
    order: LimitOrderIF;
    selectedOutsideTab: number;
    setSelectedOutsideTab: Dispatch<SetStateAction<number>>;
    outsideControl: boolean;
    setCurrentPositionActive: Dispatch<SetStateAction<string>>;
    setIsShowAllEnabled: Dispatch<SetStateAction<boolean>>;
    setOutsideControl: Dispatch<SetStateAction<boolean>>;
}
export default function SidebarLimitOrdersCard(props: propsIF) {
    const {
        tokenMap,
        chainId,
        order,
        setIsShowAllEnabled,
        setOutsideControl,
        setCurrentPositionActive,
        setSelectedOutsideTab,
        isDenomBase,
    } = props;

    const baseId = order.base + '_' + order.chainId;
    const quoteId = order.quote + '_' + order.chainId;

    const baseToken = tokenMap ? tokenMap.get(baseId.toLowerCase()) : null;
    const quoteToken = tokenMap ? tokenMap.get(quoteId.toLowerCase()) : null;

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

    const usdValueNum = order.totalValueUSD;
    const usdValueTruncated = !usdValueNum
        ? undefined
        : usdValueNum < 0.0001
        ? usdValueNum.toExponential(2)
        : usdValueNum < 2
        ? usdValueNum.toPrecision(3)
        : usdValueNum >= 10000
        ? formatAmountOld(usdValueNum, 1)
        : usdValueNum.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });

    const navigate = useNavigate();

    function handleLimitOrderClick() {
        setOutsideControl(true);
        setSelectedOutsideTab(1);
        setCurrentPositionActive(order.limitOrderIdentifier);
        setIsShowAllEnabled(false);
        navigate(
            '/trade/limit/chain=' +
            chainId +
            '&tokenA=' +
            order.base +
            '&tokenB=' +
            order.quote
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
                {usdValueTruncated ? '$' + usdValueTruncated : '…'}
            </div>
        </div>
    );
}
