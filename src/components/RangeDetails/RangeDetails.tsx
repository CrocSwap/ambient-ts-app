import Divider from '../Global/Divider/Divider';
import RemoveRangeHeader from '../RemoveRange/RemoveRangeHeader/RemoveRangeHeader';
import PriceInfo from './PriceInfo/PriceInfo';
import styles from './RangeDetails.module.css';
import TokenInfo from './TokenInfo/TokenInfo';

interface IRangeDetailsProps {
    isPositionInRange: boolean;
    isAmbient: boolean;
    baseTokenSymbol: string;
    quoteTokenSymbol: string;
    lowRangeDisplay: string;
    highRangeDisplay: string;
}

export default function RangeDetails(props: IRangeDetailsProps) {
    return (
        <div className={styles.range_details_container}>
            <RemoveRangeHeader
                isPositionInRange={props.isPositionInRange}
                isAmbient={props.isAmbient}
                baseTokenSymbol={props.baseTokenSymbol}
                quoteTokenSymbol={props.quoteTokenSymbol}
            />
            <div className={styles.main_content}>
                <TokenInfo />
                <Divider />
            </div>
            <PriceInfo
                lowRangeDisplay={props.lowRangeDisplay}
                highRangeDisplay={props.highRangeDisplay}
            />
        </div>
    );
}
