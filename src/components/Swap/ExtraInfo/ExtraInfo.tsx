import styles from 'ExtraInfo.module.css';
import { useState } from 'react';
import { FaGasPump } from 'react-icons/fa';
import { RiArrowDownSLine } from 'react-icons/ri';
interface ExtraInfoProps {
    children: React.ReactNode;
}

export default function ExtraInfo(props: ExtraInfoProps) {
    const [showExtraDetails, setShowExtraDetails] = useState<boolean>(false);

    const extraInfoDetails = (
        <div className={styles.extra_details}>
            <div className={styles.extra_row}>
                <span>Spot Price</span>
                <span>0.6969 ETH per AMBI</span>
            </div>
            <div className={styles.extra_row}>
                <span>Price Limit after Slippage and Fee</span>
                <span>0.6861 ETH per AMBI</span>
            </div>
            <div className={styles.extra_row}>
                <span>Slippage Tolerance</span>
                <span>5%</span>
            </div>
            <div className={styles.extra_row}>
                <span>Liquidity Provider Fee</span>
                <span>0.3%</span>
            </div>
        </div>
    );

    const ExtraDetailsOrNull = showExtraDetails ? extraInfoDetails : null;

    return (
        <div className={styles.extra_info_container}>
            <div
                className={styles.extra_info_content}
                onClick={() => setShowExtraDetails(!showExtraDetails)}
            >
                <div className={styles.gas_pump}>
                    <FaGasPump size={15} /> 46.26 gwei
                </div>
                <div className={styles.token_amount}>
                    1 ETH = 2600 USDC
                    <RiArrowDownSLine size={27} />{' '}
                </div>
            </div>
            {ExtraDetailsOrNull}
        </div>
    );
}
