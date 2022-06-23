import { TokenData } from '../../state/tokens/reducer';
import { isAddress } from '../../utils';
import { formatDollarAmount } from '../../utils/numbers';
import styles from './TopToken.module.css';

interface TokenProps {
    token: TokenData;
    index: number;
}

export default function TopTokenRow(props: TokenProps) {
    const tokenData: TokenData = props.token;

    function getTokenLogoURL() {
        const checkSummed = isAddress(tokenData.address);
        return `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${checkSummed}/logo.png`;
    }

    const tokenImages = (
        <>
            <td data-column='tokens' className={styles.tokens}>
                <img
                    className={styles.token_list}
                    src={getTokenLogoURL()}
                    onError={({ currentTarget }) => {
                        currentTarget.onerror = null;
                        currentTarget.src = '/static/media/ambient_logo.55c57a31.svg';
                    }}
                    alt='token'
                    width='30px'
                />

                <span className={styles.token_list_text}>
                    {tokenData.name} ({tokenData.symbol})
                </span>
            </td>
        </>
    );

    return (
        <tr>
            <td>{props.index}</td>
            {tokenImages}

            <td data-column='APY' className={styles.topToken_range}>
                {formatDollarAmount(tokenData.priceUSD)}
            </td>
            <td
                data-column='Range Status'
                className={tokenData.priceUSDChange < 0 ? styles.lowPriceChange : styles.apy}
            >
                {Math.abs(tokenData.priceUSDChange).toFixed(2)}%
            </td>
            <td data-column='Range Status'>{formatDollarAmount(tokenData.volumeUSD)}</td>
            <td data-column='Range Status'>{formatDollarAmount(tokenData.tvlUSD)}</td>
        </tr>
    );
}
