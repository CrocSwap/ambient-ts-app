import ContentContainer from '../../../components/Global/ContentContainer/ContentContainer';
import Divider from '../../../components/Global/Divider/Divider';
// import PriceInfo from '../../../components/RangeDetails/PriceInfo/PriceInfo';
// import RangeDetails from '../../../components/RangeDetails/RangeDetails';
import TokenInfo from '../../../components/RangeDetails/TokenInfo/TokenInfo';
// import RemoveRangeHeader from '../../../components/RemoveRange/RemoveRangeHeader/RemoveRangeHeader';
import styles from './PositionDetails.module.css';

export default function PositionDetails() {
    return (
        <div className={styles.range_details_container}>
            <ContentContainer customWidth>
                {/* <RemoveRangeHeader /> */}
                <div className={styles.main_content}>
                    <TokenInfo />
                    <Divider />
                </div>
                {/* <PriceInfo
                    // lowRangeDisplay={props.lowRangeDisplay}
                    // highRangeDisplay={props.highRangeDisplay}
                /> */}
            </ContentContainer>
        </div>
    );
}
