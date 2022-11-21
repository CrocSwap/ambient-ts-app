/* eslint-disable @typescript-eslint/no-explicit-any */
import { isAddress } from '../../utils';
import trimString from '../../utils/functions/trimString';
import { formatDollarAmount } from '../../utils/numbers';
import { DefaultTooltip } from '../Global/StyledTooltip/StyledTooltip';
import styles from './TopTokenRow.module.css';

interface TokenProps {
    token: any;
    index: number;
}

export default function TopTokenRow(props: TokenProps) {
    const tokenData: any = props.token;

    function handleRowClick() {
        window.open(
            `https://etherscan.io/token/${tokenData.address}`,
            '_blank',
            'noopener,noreferrer',
        );
    }

    function getTokenLogoURL() {
        const checkSummed = isAddress(tokenData.address);
        return `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${checkSummed}/logo.png`;
    }

    const IDWithTooltip = (
        <DefaultTooltip
            interactive
            title={tokenData.address}
            placement={'right'}
            arrow
            enterDelay={400}
            leaveDelay={200}
        >
            <p>{trimString(tokenData.address, 4, 4, '…')}</p>
        </DefaultTooltip>
    );

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
                    <section className={styles.displayName}> {tokenData.name}</section>
                </>

                <>
                    <section className={styles.display}> {IDWithTooltip}</section>
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
                    <section className={styles.display}>Tvl At Tick</section>
                </>

                <>
                    <section className={styles.display}>
                        {formatDollarAmount(tokenData.volumeUSD)}
                    </section>
                </>

                <>
                    <section className={styles.display}>
                        {Math.abs(tokenData.priceUSDChange).toFixed(2)}%
                    </section>
                </>
            </div>
        </div>
    );
}
