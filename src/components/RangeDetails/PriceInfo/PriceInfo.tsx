import styles from './PriceInfo.module.css';
import Row from '../../Global/Row/Row';
import DividerDark from '../../Global/DividerDark/DividerDark';
import graphImage from '../../../assets/images/Temporary/chart.svg';

interface IPriceInfoProps {
    lowRangeDisplay: string;
    highRangeDisplay: string;
}

export default function PriceInfo(props: IPriceInfoProps) {
    const removePositionInfo = (
        <div className={styles.remove_position_info}>
            <Row>
                <span>Pooled ETH</span>
                <div className={styles.token_price}>
                    1.69
                    <img
                        src='https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Ethereum-icon-purple.svg/480px-Ethereum-icon-purple.svg.png'
                        alt=''
                    />
                </div>
            </Row>
            {/*  */}
            <Row>
                <span>Pooled USDC</span>
                <div className={styles.token_price}>
                    1690.0
                    <img src='https://cryptologos.cc/logos/usd-coin-usdc-logo.png' alt='' />
                </div>
            </Row>
            {/*  */}
            <DividerDark />
            <Row>
                <span>ETH Fees Earned</span>
                <div className={styles.token_price}>
                    0.06
                    <img
                        src='https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Ethereum-icon-purple.svg/480px-Ethereum-icon-purple.svg.png'
                        alt=''
                    />
                </div>
            </Row>
            {/*  */}
            <Row>
                <span>USDC Fees Earned</span>
                <div className={styles.token_price}>
                    60.9
                    <img src='https://cryptologos.cc/logos/usd-coin-usdc-logo.png' alt='' />
                </div>
            </Row>
        </div>
    );
    return (
        <div className={styles.main_container}>
            <div className={styles.price_info_container}>
                {removePositionInfo}
                <div className={styles.graph_image_container}>
                    <img src={graphImage} alt='chart' />
                </div>
            </div>
            <div className={styles.min_max_price}>
                <div className={styles.min_max_content}>
                    Min Price
                    <span className={styles.min_price}>{props.lowRangeDisplay ?? 0}</span>
                </div>
                <div className={styles.min_max_content}>
                    Max Price
                    <span className={styles.max_price}>{props.highRangeDisplay ?? 'Infinity'}</span>
                </div>
            </div>
        </div>
    );
}
