// import { toDisplayQty } from '@crocswap-libs/sdk';
// import { useTokenMap } from '../../../../../App/components/Sidebar/useTokenMap';
import { testTokenMap } from '../../../../../utils/data/testTokenMap';
import { fetchTokenPrice } from '../../../../../App/functions/fetchTokenPrice';
import { TokenIF } from '../../../../../utils/interfaces/TokenIF';
import styles from './WalletCard.module.css';
import { useEffect, useState } from 'react';
// import { formatAmount } from '../../../../../utils/numbers';
interface WalletPropsIF {
    token?: TokenIF;
    chainId: string;
    tokenMap: Map<string, TokenIF>;
}

export default function WalletCard(props: WalletPropsIF) {
    const { token, chainId, tokenMap } = props;
    if (token === undefined) return <></>;

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
                    const price = await fetchTokenPrice(mainnetAddress, '0x1');
                    if (price) setTokenPrice(price);
                }
            } catch (err) {
                console.log(err);
            }
        })();
    }, [tokenAddress]);

    const tokenUsdPrice = tokenPrice?.usdPrice ?? 0;

    const walletBalanceNum = token.walletBalanceDisplay
        ? parseFloat(token.walletBalanceDisplay)
        : 0;

    const walletBalanceTruncated =
        token && token.walletBalanceDisplayTruncated && walletBalanceNum !== 0
            ? token.walletBalanceDisplayTruncated
            : '0';

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
        <div className={styles.wallet_row}>
            {tokenInfo}
            <p className={styles.value}>
                $
                {(tokenUsdPrice * walletBalanceNum).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                })}
            </p>
            <p className={styles.amount}>{walletBalanceTruncated}</p>
        </div>
    );
}
