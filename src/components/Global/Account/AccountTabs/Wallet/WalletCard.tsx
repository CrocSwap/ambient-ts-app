import { toDisplayQty } from '@crocswap-libs/sdk';
import { useTokenMap } from '../../../../../App/components/Sidebar/useTokenMap';
import { TokenIF } from '../../../../../utils/interfaces/TokenIF';
import styles from './WalletCard.module.css';
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

    // console.log({ token });
    // console.log({ tokenAddress });
    // console.log({ tokenMap });
    // console.log({ tokenFromMap });

    if (!tokenFromMap) {
        return <div className={styles.wallet_row}></div>;
    }

    const tokenBalance =
        token && token.symbol === 'ETH'
            ? token.balance
            : token && token.balance && token?.decimals
            ? toDisplayQty(token.balance, token.decimals)
            : '';

    const truncatedTokenBalance = tokenBalance ? parseFloat(tokenBalance).toLocaleString() : 0;

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
            <p className={styles.value}>$1,000,000.00</p>
            <p className={styles.amount}>{truncatedTokenBalance}</p>
        </div>
    );
}
