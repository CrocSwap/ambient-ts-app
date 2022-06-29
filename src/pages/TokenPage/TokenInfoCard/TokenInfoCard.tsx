import Divider from '../../../components/Global/Divider/Divider';
import { TokenData } from '../../../state/tokens/reducer';
import { formatDollarAmount } from '../../../utils/numbers';
import styles from './TokenInfoCard.module.css';
interface TokenProps {
    token?: TokenData;
}

interface InfoCardProps {
    title: string;
    body: string | number;
    info?: number;
}

export default function TokenCardInfo(props: TokenProps) {
    const token = props.token;
    function InfoCard(props: InfoCardProps) {
        const { title, body, info } = props;

        return (
            <>
                <div className={styles.title}>{title}</div>
                <div className={styles.body}>{body}</div>
                <div className={styles.body}>
                    {info ? (
                        <label className={info < 0 ? styles.lowPriceChange : styles.apy}>
                            {info.toFixed(2)}%
                        </label>
                    ) : (
                        <></>
                    )}
                </div>
            </>
        );
    }

    const tokenDataCard = (
        <div className={styles.cqwlBw}>
            {token ? (
                <>
                    <InfoCard
                        title='TVL'
                        body={formatDollarAmount(token.tvlUSD)}
                        info={Math.abs(token.tvlUSDChange)}
                    />
                    <Divider />
                    <InfoCard
                        title='24h Trading Vol'
                        body={formatDollarAmount(token.volumeUSD)}
                        info={Math.abs(token.volumeUSDChange)}
                    />
                    <Divider />
                    <InfoCard
                        title='7d Trading Vol'
                        body={formatDollarAmount(token.volumeUSDWeek)}
                    />
                    <Divider />
                    <InfoCard title='24h Fees' body={formatDollarAmount(token.feesUSD)} />
                </>
            ) : (
                <></>
            )}
        </div>
    );

    return <>{tokenDataCard}</>;
}
