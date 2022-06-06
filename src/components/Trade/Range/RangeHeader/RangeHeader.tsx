
import styles from './RangeHeader.module.css';
import { FiSettings } from 'react-icons/fi';
import ContentHeader from '../../../Global/ContentHeader/ContentHeader';
import { TokenPairIF } from '../../../../utils/interfaces/exports';

interface RangeHeaderPropsIF {
    tokenPair: TokenPairIF;
}

export default function RangeHeader(props: RangeHeaderPropsIF) {
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
