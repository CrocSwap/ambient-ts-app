import styles from './TokenSelect.module.css';
import { RiStarFill, RiStarLine } from 'react-icons/ri';
import { CgUnavailable } from 'react-icons/cg';
import { TokenIF } from '../../../utils/interfaces/exports';

interface TokenSelectProps {
    token: TokenIF;
    clickHandler: (tkn: TokenIF) => void;
    closeModal: () => void;
}

export default function TokenSelect(props: TokenSelectProps) {
    const {
        token,
        // closeModal
        clickHandler
    } = props;

    const getRandomInt = () => Math.floor(Math.random() * 18000);

    const noTokenImage = <CgUnavailable size={20} />;

    return (
        <div className={styles.modal_content} onClick={() => clickHandler(token)}>
            <div className={styles.modal_tokens_info}>
                <RiStarFill size={20} className={styles.star_filled} />
                <RiStarLine size={20} className={styles.star_line} />
                {token.logoURI ? <img src={token.logoURI} alt='' width='27px' /> : noTokenImage}
                <span className={styles.modal_token_symbol}>{token.symbol}</span>
                <span className={styles.modal_token_name}>{token.name}</span>
            </div>
            <div className={styles.modal_tokens_amount}>{getRandomInt()}</div>
        </div>
    );
}
