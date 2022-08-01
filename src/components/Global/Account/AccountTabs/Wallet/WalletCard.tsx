import { toDisplayQty } from '@crocswap-libs/sdk';
import { useTokenMap } from '../../../../../App/components/Sidebar/useTokenMap';
import { testTokenMap } from '../../../../../utils/data/testTokenMap';
import { fetchTokenPrice } from '../../../../../App/functions/fetchTokenPrice';
import { TokenIF } from '../../../../../utils/interfaces/TokenIF';
import styles from './WalletCard.module.css';
import { useEffect, useState } from 'react';
interface WalletPropsIF {
    token?: TokenIF;
    chainId: string;
}

export default function WalletCard(props: WalletPropsIF) {
    const { token, chainId } = props;

    const tokenMap = useTokenMap();

    const tokenAddress = token?.token_address
        ? token?.token_address?.toLowerCase() + '_' + chainId
        : token?.address
        ? token?.address?.toLowerCase() + '_' + chainId
        : '';

    const tokenFromMap = tokenMap && token?.token_address ? tokenMap.get(tokenAddress) : null;

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

    if (!tokenFromMap) {
        return <div className={styles.wallet_row}></div>;
    }

    const tokenBalance =
        token && token.symbol === 'ETH'
            ? token.balance
            : token && token.balance && token?.decimals
            ? toDisplayQty(token.balance, token.decimals)
            : '0';

    const tokenBalanceNum = tokenBalance ? parseFloat(tokenBalance) : 0;

    const truncatedTokenBalance = tokenBalanceNum.toLocaleString();

    const tokenInfo = (
        <div className={styles.token_info}>
            <div className={styles.token_icon}>
                <img
                    src={
                        tokenFromMap?.logoURI ??
                        'https://icons.iconarchive.com/icons/cjdowner/cryptocurrency-flat/1024/Ethereum-ETH-icon.png'
                    }
                    alt=''
                    width='30px'
                />
                <p className={styles.token_key}>{tokenFromMap?.symbol}</p>
            </div>
            <p>{tokenFromMap?.name}</p>
        </div>
    );
    return (
        <div className={styles.wallet_row}>
            {tokenInfo}
            <p className={styles.value}>${(tokenUsdPrice * tokenBalanceNum).toLocaleString()}</p>
            <p className={styles.amount}>{truncatedTokenBalance}</p>
        </div>
    );
}
