import styles from './RemoveRangeInfo.module.css';
import Row from '../../Global/Row/Row';
import Divider from '../../Global/Divider/Divider';

export default function RemoveRangeInfo() {
    return (
        <div className={styles.row}>
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
                <Divider />
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
        </div>
    );
}
