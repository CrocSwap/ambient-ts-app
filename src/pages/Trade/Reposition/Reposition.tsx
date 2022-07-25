import DividerDark from '../../../components/Global/DividerDark/DividerDark';
import RepositionDenominationSwitch from '../../../components/Trade/Reposition/RepositionDenominationSwitch/RepositionDenominationSwitch';
import RepositionHeader from '../../../components/Trade/Reposition/RepositionHeader/RepositionHeader';
import RepositionPriceInfo from '../../../components/Trade/Reposition/RepositionPriceInfo/RepositionPriceInfo';
import RepositionRangeWidth from '../../../components/Trade/Reposition/RepositionRangeWidth/RepositionRangeWidth';
import styles from './Reposition.module.css';

export default function Reposition() {
    return (
        <div className={styles.repositionContainer}>
            <RepositionHeader />
            <div className={styles.reposition_content}>
                <RepositionDenominationSwitch />
                <DividerDark />
                <RepositionRangeWidth />
                <RepositionPriceInfo />
            </div>
        </div>
    );
}
