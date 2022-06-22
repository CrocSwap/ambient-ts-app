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

    const getTokenLogoURL = () => {
        const checkSummed = isAddress(tokenData.address);
        if (checkSummed && tokenData.address) {
            return `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${checkSummed}/logo.png`;
        }

        return 'http://www.w3.org/2000/svg';
    };

    const tokenImages = (
        <>
            <td data-column='tokens' className={styles.tokens}>
                <img src={getTokenLogoURL()} alt='token' width='30px' />
                {tokenData.name} ({tokenData.symbol})
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
            <td data-column='Range Status' className={styles.apy}>
                {Math.abs(tokenData.priceUSDChange).toFixed(2)}%
            </td>
            <td data-column='Range Status'>{formatDollarAmount(tokenData.volumeUSD)}</td>
            <td data-column='Range Status'>{formatDollarAmount(tokenData.tvlUSD)}</td>
        </tr>
    );
}
