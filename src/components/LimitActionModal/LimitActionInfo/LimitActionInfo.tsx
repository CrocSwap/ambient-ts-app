import Row from '../../Global/Row/Row';
import styles from './LimitActionInfo.module.css';

interface ILimitActionInfoProps {
    type: 'Remove' | 'Claim';
    usdValue: string;
    tokenQuantity: string | undefined;
    tokenQuantityLogo: string;
    limitOrderPrice: string | undefined;
    limitOrderPriceLogo: string;
    receivingAmount: string | undefined;
    receivingAmountLogo: string;
    networkFee: string | undefined;
}

export default function LimitActionInfo(props: ILimitActionInfoProps) {
    const {
        type,
        usdValue,
        tokenQuantity,
        tokenQuantityLogo,
        limitOrderPrice,
        limitOrderPriceLogo,
        receivingAmount,
        receivingAmountLogo,
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
                            <p className={styles.info_text}>{tokenQuantity}</p>
                            <img src={tokenQuantityLogo} alt='' width='15px' />
                        </div>
                    </Row>
                    <Row>
                        <span>Limit Order Price</span>
                        <div className={styles.align_center}>
                            <p className={styles.info_text}>
                                {limitOrderPrice}
                            </p>
                            <img
                                src={limitOrderPriceLogo}
                                alt=''
                                width='15px'
                            />
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
                                {receivingAmount}
                            </p>
                            <img
                                src={receivingAmountLogo}
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
