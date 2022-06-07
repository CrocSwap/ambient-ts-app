import styles from './TokenSelect.module.css';
import { RiStarFill, RiStarLine } from 'react-icons/ri';
import { CgUnavailable } from 'react-icons/cg';
import { setAddressTokenA, setAddressTokenB } from '../../../utils/state/tradeDataSlice';
import { useAppDispatch } from '../../../utils/hooks/reduxToolkit';
// import { TokenIF } from '../../../utils/interfaces/TokenIF';
import { TokenPairIF } from '../../../utils/interfaces/exports';

interface TokenSelectProps {
    tokenPair: TokenPairIF;
    icon: string;
    qty?: number;
    symbol: string;
    name: string;
    address: string;
    tokenToUpdate: string;
    closeModal: () => void;
    reverseTokens: () => void;
}

export default function TokenSelect(props: TokenSelectProps) {
    const { icon, symbol, name, address, tokenToUpdate, closeModal, tokenPair, reverseTokens } =
        props;
    function getRandomInt() {
        return Math.floor(Math.random() * 18000);
    }

    const dispatch = useAppDispatch();

    const fakeQty = getRandomInt();

    const noTokenImage = <CgUnavailable size={20} />;

    const handleClick = (): void => {
        if (tokenToUpdate === 'A') {
            if (tokenPair.dataTokenB.address === address) {
                console.log('token A matches token B');

                reverseTokens();
                dispatch(setAddressTokenA(address));
                dispatch(setAddressTokenB(tokenPair.dataTokenA.address));
            } else {
                dispatch(setAddressTokenA(address));
            }
        } else if (tokenToUpdate === 'B') {
            if (tokenPair.dataTokenA.address === address) {
                console.log('token B matches token A');
                reverseTokens();

                dispatch(setAddressTokenB(address));
                dispatch(setAddressTokenA(tokenPair.dataTokenB.address));
            } else {
                dispatch(setAddressTokenB(address));
            }
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
