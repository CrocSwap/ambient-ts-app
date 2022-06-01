import styles from './TokenSelect.module.css';
import { RiStarFill, RiStarLine } from 'react-icons/ri';
import { CgUnavailable } from 'react-icons/cg';

interface TokenSelectProps {
    icon: string;
    qty?: number;
    symbol: string;
    name: string;
}

export default function TokenSelect(props: TokenSelectProps) {
    const { icon, symbol, name } = props;
    function getRandomInt() {
        return Math.floor(Math.random() * 18000);
    }

    const fakeQty = getRandomInt();

    const noTokenImage = <CgUnavailable size={20} />;

    return (
        <div className={styles.modal_content}>
            <div className={styles.modal_tokens_info}>
                <RiStarFill size={20} className={styles.star_filled} />
                <RiStarLine size={20} className={styles.star_line} />
                {icon ? <img src={icon} alt='' width='27px' /> : noTokenImage}
                <span className={styles.modal_token_symbol}>{symbol}</span>
                <span className={styles.modal_token_name}>{name}</span>
            </div>
            <div className={styles.modal_tokens_amount}>{fakeQty}</div>
        </div>
    );
}
