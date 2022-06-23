// START: Import React and Dongles
import { FiSettings } from 'react-icons/fi';

// START: Import React Functional Components
import ContentHeader from '../../../Global/ContentHeader/ContentHeader';

// START: Import Local Files
import styles from './RangeHeader.module.css';
import { TokenPairIF } from '../../../../utils/interfaces/exports';

// interface for component props
interface RangeHeaderPropsIF {
    tokenPair: TokenPairIF;
    isDenomBase: boolean;
}

// central react functional component
export default function RangeHeader(props: RangeHeaderPropsIF) {
    const { tokenPair, isDenomBase } = props;

    return (
        <ContentHeader>
            <span />
            <div className={styles.token_info}>
                {isDenomBase ? tokenPair.dataTokenA.symbol : tokenPair.dataTokenB.symbol} /{' '}
                {isDenomBase ? tokenPair.dataTokenB.symbol : tokenPair.dataTokenA.symbol}
            </div>
            <FiSettings />
        </ContentHeader>
    );
}
