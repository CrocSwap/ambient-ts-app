import styles from './TokenSelect.module.css';
import { CgUnavailable } from 'react-icons/cg';
import { TokenIF } from '../../../utils/interfaces/exports';
import uriToHttp from '../../../utils/functions/uriToHttp';

interface TokenSelectProps {
    token: TokenIF;
    clickHandler: (tkn: TokenIF) => void;
}

export default function TokenSelect(props: TokenSelectProps) {
    const { token, clickHandler } = props;

    const noTokenImage = <CgUnavailable size={20} />;

    return (
        <div className={styles.modal_content} onClick={() => clickHandler(token)}>
            <div className={styles.modal_tokens_info}>
                {token.logoURI ? <img src={uriToHttp(token.logoURI)} alt={`logo for token ${token.name}`} width='27px' /> : noTokenImage}
                <span className={styles.modal_token_symbol}>{token.symbol}</span>
                <span className={styles.modal_token_name}>{token.name}</span>
            </div>
        </div>
    );
}
