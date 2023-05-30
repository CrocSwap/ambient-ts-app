import styles from './Exchange.module.css';
import ExchangeCard from './ExchangeCard';
import ExchangeHeader from './ExchangeHeader';
import { TokenIF } from '../../../../../utils/interfaces/exports';

interface propsIF {
    connectedUserTokens: (TokenIF | undefined)[];
    resolvedAddressTokens: (TokenIF | undefined)[];
    resolvedAddress: string;
    connectedAccountActive: boolean;
}

export default function Exchange(props: propsIF) {
    const {
        connectedAccountActive,
        connectedUserTokens,
        resolvedAddressTokens,
    } = props;

    const ItemContent = connectedAccountActive
        ? connectedUserTokens.map((item, idx) => (
              <ExchangeCard key={idx} token={item} />
          ))
        : resolvedAddressTokens.map((item, idx) => (
              <ExchangeCard key={idx} token={item} />
          ));

    return (
        <div
            className={styles.container}
            style={{ height: 'calc(100vh - 19.5rem' }}
        >
            <ExchangeHeader />
            <div className={styles.item_container}>{ItemContent}</div>
        </div>
    );
}
