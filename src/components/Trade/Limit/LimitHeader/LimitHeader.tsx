// START: Import React and Dongles
import { FiSettings } from 'react-icons/fi';

// START: Import React Functional Components
import ContentHeader from '../../../Global/ContentHeader/ContentHeader';

// START: Import Local Files
import styles from './LimitHeader.module.css';
import { TokenPairIF } from '../../../../utils/interfaces/exports';

// interface for component props
interface LimitHeaderPropsIF {
    tokenPair: TokenPairIF;
}

// central react functional component
export default function LimitHeader(props: LimitHeaderPropsIF) {
    const { tokenPair } = props;

    return (
        <ContentHeader>
            <span />
            <div className={styles.token_info}>
                {tokenPair.dataTokenA.symbol} / {tokenPair.dataTokenB.symbol}
            </div>
            <FiSettings />
        </ContentHeader>
    );
}
