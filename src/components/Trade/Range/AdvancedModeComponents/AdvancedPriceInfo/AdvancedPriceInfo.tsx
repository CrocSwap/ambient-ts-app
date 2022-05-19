import styles from './AdvancedPriceInfo.module.css';
import Row from '../../../../Global/Row/Row';

const currentPrice = (
    <>
        <Row>
            <span>Current Price</span>
            <span>2,800</span>
        </Row>

        <Row>
            <span>Est.APY</span>
            <span>35.68%</span>
        </Row>
    </>
);

const balancedData = (
    <>
        <Row>
            <span>ETH Balance</span>
            <span>0.00</span>
            <span>0.69</span>
        </Row>
        <Row>
            <span>USDC Balance</span>
            <span>1,000.0</span>
            <span>500.0</span>
        </Row>
    </>
);

const rangeData = (
    <>
        <Row>
            <span>Range Upper Limit</span>
            <span>2,000.0</span>
            <span>2,120.0</span>
        </Row>
        <Row>
            <span>Range Lower Limit</span>
            <span>1,000.0</span>
            <span>3,200.0</span>
        </Row>
    </>
);
export default function AdvancedPriceInfo() {
    return (
        <div className={styles.price_info_container}>
            <div className={styles.price_info_content}>
                {currentPrice}

                {/* <Divider /> */}
                <Row>
                    <span></span>
                    <span className={styles.current}>Current</span>
                    <span>Repositioned To</span>
                </Row>
                {balancedData}
                {/* <Divider /> */}
                {rangeData}
            </div>
        </div>
    );
}
