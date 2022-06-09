import styles from './TokenSelect.module.css';
import { RiStarFill, RiStarLine } from 'react-icons/ri';
import { CgUnavailable } from 'react-icons/cg';
import { setTokenA, setTokenB } from '../../../utils/state/tradeDataSlice';
import { useAppDispatch } from '../../../utils/hooks/reduxToolkit';
// import { SetStateAction } from 'react';
import { TokenIF, TokenPairIF } from '../../../utils/interfaces/exports';

interface TokenSelectProps {
    token: TokenIF;
    tokenPair: TokenPairIF;
    tokenToUpdate: string;
    closeModal: () => void;
    reverseTokens: () => void;
}

export default function TokenSelect(props: TokenSelectProps) {
    const { token, tokenToUpdate, closeModal, tokenPair, reverseTokens } = props;

    const dispatch = useAppDispatch();

    const getRandomInt = () => Math.floor(Math.random() * 18000);

    const noTokenImage = <CgUnavailable size={20} />;

    // TODO: @Emily refactor the control flow here for simplicity
    // TODO: ... we also risk race conditions depending on the
    // TODO: ... sequence of dispatches
    const handleClick = (): void => {
        if (tokenToUpdate === 'A') {
            if (tokenPair.dataTokenB.address === token.address) {
                console.log('token A matches token B');
                reverseTokens();
                dispatch(setTokenA(token));
                dispatch(setTokenB(tokenPair.dataTokenA));
            } else {
                dispatch(setTokenA(token));
            }
        } else if (tokenToUpdate === 'B') {
            if (tokenPair.dataTokenA.address === token.address) {
                console.log('token B matches token A');
                reverseTokens();
                dispatch(setTokenB(token));
                dispatch(setTokenA(tokenPair.dataTokenB));
            } else {
                dispatch(setTokenB(token));
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
            <div className={styles.modal_tokens_amount}>{getRandomInt()}</div>
        </div>
    );
}
