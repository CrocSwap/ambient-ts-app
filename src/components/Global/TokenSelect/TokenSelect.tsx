import styles from './TokenSelect.module.css';
import { CgUnavailable } from 'react-icons/cg';
import { setTokenA, setTokenB, setDidUserFlipDenom } from '../../../utils/state/tradeDataSlice';
import { useAppDispatch } from '../../../utils/hooks/reduxToolkit';
import { TokenIF, TokenPairIF } from '../../../utils/interfaces/exports';
import { AiFillCloseSquare } from 'react-icons/ai';

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
                reverseTokens();
                dispatch(setTokenA(token));
                dispatch(setTokenB(tokenPair.dataTokenA));
            } else {
                dispatch(setTokenA(token));
                dispatch(setDidUserFlipDenom(false));
            }
        } else if (tokenToUpdate === 'B') {
            if (tokenPair.dataTokenA.address === token.address) {
                reverseTokens();
                dispatch(setTokenB(token));
                dispatch(setTokenA(tokenPair.dataTokenB));
            } else {
                dispatch(setTokenB(token));
                dispatch(setDidUserFlipDenom(false));
            }
        } else {
            console.warn('Error in TokenSelect.tsx, failed to find proper dispatch function.');
        }
        closeModal();
    };

    // As much as I dislike directing using svgs in code, this is the only way we can style the fill on hover...unless we want to bring in two different SVGS.
    const starIcon = (
        <div className={styles.star_icon}>
            <svg
                width='23'
                height='23'
                viewBox='0 0 23 23'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
            >
                <path
                    d='M11.5 1.58301L14.7187 8.10384L21.9166 9.15593L16.7083 14.2288L17.9375 21.3955L11.5 18.0101L5.06248 21.3955L6.29165 14.2288L1.08331 9.15593L8.28123 8.10384L11.5 1.58301Z'
                    stroke='#BDBDBD'
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    className={styles.star_svg}
                />
            </svg>
        </div>
    );

    const closeIcon = (
        <div className={styles.close_icon}>
            <AiFillCloseSquare size={20} className={styles.close_icon_svg} />
        </div>
    );

    return (
        <div className={styles.main_container}>
            {starIcon}
            <div className={styles.modal_content} onClick={handleClick}>
                <div className={styles.modal_tokens_info}>
                    {token.logoURI ? <img src={token.logoURI} alt='' width='27px' /> : noTokenImage}
                    <span className={styles.modal_token_symbol}>{token.symbol}</span>
                    <span className={styles.modal_token_name}>{token.name}</span>
                </div>
                <div className={styles.modal_tokens_amount}>{getRandomInt()}</div>
            </div>
            {closeIcon}
        </div>
    );
}
