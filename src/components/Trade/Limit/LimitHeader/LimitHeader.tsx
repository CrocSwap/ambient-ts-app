// START: Import React and Dongles
import { FiSettings } from 'react-icons/fi';

// START: Import React Functional Components
import ContentHeader from '../../../Global/ContentHeader/ContentHeader';

// START: Import Local Files
import styles from './LimitHeader.module.css';
import { TokenIF } from '../../../../utils/interfaces/TokenIF';

// interface for component props
interface LimitHeaderPropsIF {
    tokenPair: {
        dataTokenA: TokenIF;
        dataTokenB: TokenIF;
    };
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
