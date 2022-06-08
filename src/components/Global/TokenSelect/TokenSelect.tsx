import styles from './TokenSelect.module.css';
import { RiStarFill, RiStarLine } from 'react-icons/ri';
import { CgUnavailable } from 'react-icons/cg';
import { setAddressTokenA, setAddressTokenB } from '../../../utils/state/tradeDataSlice';
import { useAppDispatch } from '../../../utils/hooks/reduxToolkit';
// import { TokenIF } from '../../../utils/interfaces/TokenIF';
import { SetStateAction } from 'react';
import { TokenIF, TokenPairIF } from '../../../utils/interfaces/exports';

interface TokenSelectProps {
    token: TokenIF;
    tokenPair: TokenPairIF;
    tokenToUpdate: string;
    closeModal: () => void;
    setIsReversalInProgress: React.Dispatch<SetStateAction<boolean>>;
}

export default function TokenSelect(props: TokenSelectProps) {
    const { token, tokenToUpdate, closeModal, tokenPair, setIsReversalInProgress } = props;
    function getRandomInt() {
        return Math.floor(Math.random() * 18000);
    }

    const dispatch = useAppDispatch();

    const fakeQty = getRandomInt();

    const noTokenImage = <CgUnavailable size={20} />;

    const handleClick = (): void => {
        if (tokenToUpdate === 'A') {
            if (tokenPair.dataTokenB.address === token.address) {
                setIsReversalInProgress(true);
                dispatch(setAddressTokenA(token.address));
                dispatch(setAddressTokenB(tokenPair.dataTokenA.address));
            } else {
                dispatch(setAddressTokenA(token.address));
            }
        } else if (tokenToUpdate === 'B') {
            if (tokenPair.dataTokenA.address === token.address) {
                setIsReversalInProgress(true);
                dispatch(setAddressTokenB(token.address));
                dispatch(setAddressTokenA(tokenPair.dataTokenB.address));
            } else {
                dispatch(setAddressTokenB(token.address));
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
                {token.logoURI ? <img src={token.logoURI} alt='' width='27px' /> : noTokenImage}
                <span className={styles.modal_token_symbol}>{token.symbol}</span>
                <span className={styles.modal_token_name}>{token.name}</span>
            </div>
            <div className={styles.modal_tokens_amount}>{fakeQty}</div>
        </div>
    );
}
