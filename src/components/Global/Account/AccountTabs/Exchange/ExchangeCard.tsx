import styles from './ExchangeCard.module.css';
import { testTokenMap } from '../../../../../utils/data/testTokenMap';
// import { fetchTokenPrice } from '../../../../../App/functions/fetchTokenPrice';
import { TokenIF } from '../../../../../utils/interfaces/TokenIF';
import { useEffect, useState } from 'react';
import { ZERO_ADDRESS } from '../../../../../constants';
import { TokenPriceFn } from '../../../../../App/functions/fetchTokenPrice';
// import { formatAmount } from '../../../../../utils/numbers';
interface ExchangeCardPropsIF {
    cachedFetchTokenPrice: TokenPriceFn;
    token?: TokenIF;
    chainId: string;
    tokenMap: Map<string, TokenIF>;
}

export default function ExchangeCard(props: ExchangeCardPropsIF) {
    const { token, chainId, tokenMap, cachedFetchTokenPrice } = props;
    if (token?.address !== ZERO_ADDRESS && token?.dexBalanceDisplayTruncated === undefined)
        return <></>;

    // const tokenMap = useTokenMap();

    const tokenAddress = token?.address?.toLowerCase() + '_' + chainId;

    const tokenFromMap = tokenMap && tokenAddress ? tokenMap.get(tokenAddress) : null;

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
                const mainnetAddress = testTokenMap.get(tokenAddress)?.split('_')[0];
                if (mainnetAddress) {
                    const price = await cachedFetchTokenPrice(mainnetAddress, '0x1');
                    if (price) setTokenPrice(price);
                }
            } catch (err) {
                console.log(err);
            }
        })();
    }, [tokenAddress]);

    const tokenUsdPrice = tokenPrice?.usdPrice ?? 0;

    const exchangeBalanceNum = token.dexBalanceDisplay ? parseFloat(token.dexBalanceDisplay) : 0;
    const exchangeBalanceTruncated =
        exchangeBalanceNum === 0 ? '0' : token?.dexBalanceDisplayTruncated;

    // const tokenBalanceNum =
    //     token && token.combinedBalanceDisplay ? parseFloat(token.combinedBalanceDisplay) : 0;

    // const truncatedTokenBalance =
    //     tokenBalanceNum === 0
    //         ? '0'
    //         : tokenBalanceNum < 0.0001
    //         ? tokenBalanceNum.toExponential(2)
    //         : tokenBalanceNum < 2
    //         ? tokenBalanceNum.toPrecision(3)
    //         : tokenBalanceNum >= 1000000
    //         ? formatAmount(tokenBalanceNum)
    //         : // ? quoteLiqDisplayNum.toExponential(2)
    //           tokenBalanceNum.toLocaleString(undefined, {
    //               minimumFractionDigits: 2,
    //               maximumFractionDigits: 2,
    //           });

    const tokenInfo = (
        <div className={styles.token_info}>
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
            <p>{tokenFromMap?.name ? tokenFromMap?.name : token?.name ? token?.name : '???'}</p>
        </div>
    );
    return (
        <div className={styles.exchange_row}>
            {tokenInfo}
            <p className={styles.value}>
                $
                {(tokenUsdPrice * exchangeBalanceNum).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                })}
            </p>
            <p className={styles.amount}>{exchangeBalanceTruncated}</p>
        </div>
    );
}
