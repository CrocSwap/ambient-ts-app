import styles from './ExchangeCard.module.css';
import { testTokenMap } from '../../../../../utils/data/testTokenMap';
import { TokenIF } from '../../../../../utils/interfaces/exports';
import { useContext, useEffect, useState } from 'react';
import { ZERO_ADDRESS } from '../../../../../constants';
import { DefaultTooltip } from '../../../StyledTooltip/StyledTooltip';
import { memoizeTokenPrice } from '../../../../../App/functions/fetchTokenPrice';
import { TokenContext } from '../../../../../contexts/TokenContext';
import { CrocEnvContext } from '../../../../../contexts/CrocEnvContext';

interface propsIF {
    token?: TokenIF;
}

export default function ExchangeCard(props: propsIF) {
    const { token } = props;
    const {
        tokens: { getTokenByAddress },
    } = useContext(TokenContext);

    const {
        chainData: { chainId },
    } = useContext(CrocEnvContext);

    const cachedFetchTokenPrice = memoizeTokenPrice();

    const tokenMapKey: string = token?.address + '_' + chainId;

    const tokenFromMap = token?.address
        ? getTokenByAddress(token.address)
        : null;

    const [tokenPrice, setTokenPrice] = useState<{
        nativePrice?:
            | {
                  value: string;
                  decimals: number;
                  name: string;
                  symbol: string;
              }
            | undefined;
        usdPrice: number;
        exchangeAddress?: string | undefined;
        exchangeName?: string | undefined;
    }>();

    useEffect(() => {
        (async () => {
            try {
                const mainnetAddress = testTokenMap
                    .get(tokenMapKey)
                    ?.split('_')[0];
                if (mainnetAddress) {
                    const price = await cachedFetchTokenPrice(
                        mainnetAddress,
                        '0x1',
                    );
                    if (price) setTokenPrice(price);
                }
            } catch (err) {
                console.error(err);
            }
        })();
    }, [tokenMapKey]);

    const tokenUsdPrice = tokenPrice?.usdPrice ?? 0;

    const exchangeBalanceNum = token?.dexBalanceDisplay
        ? parseFloat(token?.dexBalanceDisplay)
        : 0;

    const exchangeBalanceTruncated =
        exchangeBalanceNum === 0 ? '0' : token?.dexBalanceDisplayTruncated;

    const iconAndSymbolWithTooltip = (
        <DefaultTooltip
            interactive
            title={`${tokenFromMap?.symbol}: ${tokenFromMap?.address}`}
            disableHoverListener={tokenFromMap?.address === ZERO_ADDRESS}
            placement={'right'}
            arrow
            enterDelay={400}
            leaveDelay={200}
        >
            <div className={styles.token_icon}>
                <img
                    src={
                        tokenFromMap?.logoURI
                            ? tokenFromMap?.logoURI
                            : token?.logoURI
                            ? token?.logoURI
                            : 'https://icons.iconarchive.com/icons/cjdowner/cryptocurrency-flat/1024/Ethereum-ETH-icon.png'
                    }
                    alt=''
                    width='30px'
                />
                <p className={styles.token_key}>
                    {tokenFromMap?.symbol
                        ? tokenFromMap?.symbol
                        : token?.symbol
                        ? token?.symbol
                        : '???'}
                </p>
            </div>
        </DefaultTooltip>
    );

    const tokenInfo = (
        <div className={styles.token_info}>
            {iconAndSymbolWithTooltip}
            <p>
                {tokenFromMap?.name
                    ? tokenFromMap?.name
                    : token?.name
                    ? token?.name
                    : '???'}
            </p>
        </div>
    );

    if (
        !token ||
        !tokenFromMap ||
        (token.address !== ZERO_ADDRESS &&
            (!token.dexBalance || token.dexBalance === '0'))
    )
        return <></>;

    return (
        <div className={styles.exchange_row}>
            {tokenInfo}
            <p className={styles.value}>
                $
                {(tokenUsdPrice * exchangeBalanceNum).toLocaleString(
                    undefined,
                    {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                    },
                )}
            </p>
            <p className={styles.amount}>{exchangeBalanceTruncated}</p>
        </div>
    );
}
