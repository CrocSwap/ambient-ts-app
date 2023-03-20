import styles from './TokenCard.module.css';
import { TokenIF } from '../../../../utils/interfaces/exports';
import NoTokenIcon from '../../../Global/NoTokenIcon/NoTokenIcon';

interface propsIF {
    token: TokenIF;
    chainId: string;
}

export default function TokenCard(props: propsIF) {
    const { token, chainId } = props;
    false && chainId;

    return (
        <li className={styles.token_card}>
            <div className={styles.token_name}>
                {token.logoURI ? (
                    <img
                        className={styles.token_icon}
                        src={token.logoURI}
                        // alt={`logo for ${token.name}`}
                        alt={''}
                    />
                ) : (
                    <NoTokenIcon tokenInitial={token.symbol.charAt(0)} width='30px' />
                )}

                <div>
                    <h5>{token.name}</h5>
                    <h5>{token.symbol}</h5>
                </div>
            </div>
            <p>{token.chainId}</p>
            <p className={styles.address}>{token.address}</p>
        </li>
    );
}
