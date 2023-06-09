import Row from '../../Global/Row/Row';
import styles from './LimitActionInfo.module.css';

interface ILimitActionInfoProps {
    type: 'Remove' | 'Claim';
    baseTokenLogoURI: string;
    quoteTokenLogoURI: string;
    usdValue: string;
    baseDisplay: string;
    quoteDisplay: string;
    truncatedDisplayPrice: string | undefined;
    networkFee: string | undefined;
}

export default function LimitActionInfo(props: ILimitActionInfoProps) {
    const {
        type,
        baseTokenLogoURI,
        quoteTokenLogoURI,
        usdValue,
        baseDisplay,
        quoteDisplay,
        truncatedDisplayPrice,
        networkFee,
    } = props;

    return (
        <div className={styles.row}>
            <div className={styles.remove_position_info}>
                <div className={styles.info_container}>
                    <Row>
                        <span>Total Value</span>
                        <div className={styles.token_price}>
                            {'$' + usdValue}
                        </div>
                    </Row>
                </div>
                <div className={styles.info_container}>
                    <Row>
                        <span>Token Quantity</span>
                        <div className={styles.align_center}>
                            <p className={styles.info_text}>{baseDisplay}</p>
                            <img src={baseTokenLogoURI} alt='' width='15px' />
                        </div>
                    </Row>
                    <Row>
                        <span>Limit Order Price</span>
                        <div className={styles.align_center}>
                            <p className={styles.info_text}>
                                {type === 'Remove'
                                    ? quoteDisplay
                                    : truncatedDisplayPrice}
                            </p>
                            {type === 'Remove' && (
                                <img
                                    src={quoteTokenLogoURI}
                                    alt=''
                                    width='15px'
                                />
                            )}
                        </div>
                    </Row>
                </div>
                <div className={styles.info_container}>
                    <Row>
                        <span>
                            {type === 'Remove'
                                ? 'Return Quantity'
                                : 'Claimable Amount'}{' '}
                        </span>
                        <div className={styles.align_center}>
                            <p className={styles.info_text}>
                                {type === 'Remove' ? baseDisplay : quoteDisplay}
                            </p>
                            <img
                                src={
                                    type === 'Remove'
                                        ? baseTokenLogoURI
                                        : quoteTokenLogoURI
                                }
                                alt=''
                                width='15px'
                            />
                        </div>
                    </Row>
                </div>
            </div>
            <div className={styles.network_fee_container}>
                <div>
                    <span>Network Fee</span>
                </div>
                <span>~{networkFee}</span>
            </div>
        </div>
    );
}
