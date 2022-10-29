import styles from './TokenCard.module.css';
import { TokenIF } from '../../../../utils/interfaces/exports';

interface propsIF {
    token: TokenIF;
    chainId: string;
}

export default function TokenCard(props: propsIF) {
    const {
        token,
        chainId
    } = props;

    false && chainId;

    return (
        <div className={styles.exchange_row}>
            <p>{token.name}</p>
            <p>{token.symbol}</p>
            <p>{token.chainId}</p>
            <p>{token.address}</p>
        </div>
    );
}