import styles from './ExchangeCard.module.css';
import { testTokenMap } from '../../../../../utils/data/testTokenMap';
import { TokenIF } from '../../../../../utils/interfaces/exports';
import { useContext, useEffect, useState } from 'react';
import { ETH_ICON_URL, ZERO_ADDRESS } from '../../../../../constants';
import { DefaultTooltip } from '../../../StyledTooltip/StyledTooltip';
import { TokenContext } from '../../../../../contexts/TokenContext';
import { CrocEnvContext } from '../../../../../contexts/CrocEnvContext';
import { TokenPriceFn } from '../../../../../App/functions/fetchTokenPrice';
import { getFormattedNumber } from '../../../../../App/functions/getFormattedNumber';
import uriToHttp from '../../../../../utils/functions/uriToHttp';
import TokenIcon from '../../../TokenIcon/TokenIcon';

interface propsIF {
    token?: TokenIF;
    cachedFetchTokenPrice: TokenPriceFn;
}

export default function ExchangeCard(props: propsIF) {
    const { token, cachedFetchTokenPrice } = props;
    const {
        tokens: { getTokenByAddress },
    } = useContext(TokenContext);

    const {
        chainData: { chainId },
    } = useContext(CrocEnvContext);

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
                const tokenAddress = tokenMapKey.split('_')[0];
                const chain = tokenMapKey.split('_')[1];
                const isChainMainnet = chain === '0x1';
                const mainnetAddress =
                    isChainMainnet && tokenAddress !== ZERO_ADDRESS
                        ? tokenMapKey.split('_')[0]
                        : testTokenMap.get(tokenMapKey)?.split('_')[0];
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
                <TokenIcon
                    src={uriToHttp(
                        tokenFromMap?.logoURI
                            ? tokenFromMap?.logoURI
                            : token?.logoURI
                            ? token?.logoURI
                            : ETH_ICON_URL,
                    )}
                    alt=''
                    size='2xl'
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
                {getFormattedNumber({
                    value: tokenUsdPrice * exchangeBalanceNum,
                    isUSD: true,
                    prefix: '$',
                })}
            </p>
            <p className={styles.amount}>{exchangeBalanceTruncated}</p>
        </div>
    );
}
