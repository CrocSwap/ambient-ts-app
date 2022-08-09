import { useNavigate } from 'react-router-dom';
import { TokenData } from '../../state/tokens/models';
import { isAddress } from '../../utils';
import { formatDollarAmount } from '../../utils/numbers';
import TradeButton from '../Global/Analytics/TradeButton';
import styles from './TopToken.module.css';

interface TokenProps {
    token: TokenData;
    index: number;
}

export default function TopTokenRow(props: TokenProps) {
    const tokenData: TokenData = props.token;
    const navigate = useNavigate();

    function handleRowClick() {
        navigate('/tokens/' + tokenData.address);
    }

    function getTokenLogoURL() {
        const checkSummed = isAddress(tokenData.address);
        return `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${checkSummed}/logo.png`;
    }

    const tokenImages = (
        <div className={styles.tokens_container}>
            <div className={styles.token_icon}>
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
            </div>
            <p className={styles.token_key}>{tokenData.symbol}</p>
        </div>
    );

    return (
        <div className={styles.main_container} onClick={handleRowClick}>
            {tokenImages}

            <div className={styles.row_container}>
                <>
                    <section className={styles.display}> {tokenData.name}</section>
                </>

                <>
                    <section className={styles.display}>
                        {formatDollarAmount(tokenData.priceUSD)}
                    </section>
                </>

                <>
                    <section className={styles.display}>
                        {formatDollarAmount(tokenData.tvlUSD)}
                    </section>
                </>

                <>
                    <section className={styles.display}>
                        {formatDollarAmount(tokenData.volumeUSD)}
                    </section>
                </>

                <>
                    <section className={styles.display}>
                        {' '}
                        {Math.abs(tokenData.priceUSDChange).toFixed(2)}%
                    </section>
                </>
            </div>

            <div className={styles.menu_container}>
                <TradeButton />
            </div>
        </div>
    );
}
