import uriToHttp from '../../../../utils/functions/uriToHttp';
import { TokenIF } from '../../../../utils/interfaces/TokenIF';
import NoTokenIcon from '../../NoTokenIcon/NoTokenIcon';
import styles from './RecentToken.module.css';

interface RecentTokenProps {
    token: TokenIF;
    clickHandler: () => void;
}
export default function RecentToken(props: RecentTokenProps) {
    const { token, clickHandler } = props;
    // console.log({ token });
    return (
        <div className={styles.recent_token} onClick={clickHandler}>
            {token.logoURI ? (
                <img
                    src={uriToHttp(token.logoURI)}
                    alt={token.name}
                    className={styles.token_logo}
                    width='20px'
                />
            ) : (
                <NoTokenIcon tokenInitial={token.symbol.charAt(0)} width='20px' />
            )}
            <span>{token.symbol}</span>
        </div>
    );
}
