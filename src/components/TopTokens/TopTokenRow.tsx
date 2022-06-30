import { useNavigate } from 'react-router-dom';
import { TokenData } from '../../state/tokens/models';
import { isAddress } from '../../utils';
import { formatDollarAmount } from '../../utils/numbers';
import styles from './TopToken.module.css';

interface TokenProps {
    token: TokenData;
    index: number;
}

export default function TopTokenRow(props: TokenProps) {
    const tokenData: TokenData = props.token;
    const navigate = useNavigate();

    function getTokenLogoURL() {
        const checkSummed = isAddress(tokenData.address);
        return `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${checkSummed}/logo.png`;
    }

    const tokenImages = (
        <td data-column='name' width={350}>
            <td>
                <img
                    className={styles.token_list}
                    src={getTokenLogoURL()}
                    onError={({ currentTarget }) => {
                        currentTarget.onerror = null;
                        currentTarget.src = '/question.svg';
                    }}
                    alt='token'
                    width='30px'
                />
            </td>
            <td>
                <span className={styles.token_list_text}>
                    {tokenData.name} ({tokenData.symbol})
                </span>
            </td>
        </td>
    );

    function handleRowClick() {
        navigate('/tokens/' + tokenData.address);
    }
    return (
        <tr onClick={handleRowClick} style={{ cursor: 'pointer' }}>
            <td className={styles.topToken_id}>{props.index}</td>
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
