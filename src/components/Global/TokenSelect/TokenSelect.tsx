import styles from './TokenSelect.module.css';
import { RiStarFill, RiStarLine } from 'react-icons/ri';
import { CgUnavailable } from 'react-icons/cg';
import { setAddressTokenA, setAddressTokenB } from '../../../utils/state/tradeDataSlice';
import { useAppDispatch } from '../../../utils/hooks/reduxToolkit';

interface TokenSelectProps {
    icon: string;
    qty?: number;
    symbol: string;
    name: string;
    address: string;
    tokenToUpdate: string;
    closeModal: () => void;
}

export default function TokenSelect(props: TokenSelectProps) {
    const { icon, symbol, name, address, tokenToUpdate, closeModal } = props;
    function getRandomInt() {
        return Math.floor(Math.random() * 18000);
    }

    const dispatch = useAppDispatch();

    const fakeQty = getRandomInt();

    const noTokenImage = <CgUnavailable size={20} />;

    const handleClick = (): void => {
        if (tokenToUpdate === 'A') {
            dispatch(setAddressTokenA(address));
        } else if (tokenToUpdate === 'B') {
            dispatch(setAddressTokenB(address));
        } else {
            console.warn('Error in TokenSelect.tsx, failed to find proper dispatch function.');
        }
        closeModal();
    };

    return (
        <div className={styles.modal_content} onClick={handleClick}>
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
