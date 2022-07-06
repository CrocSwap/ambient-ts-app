import styles from './TokenSelect.module.css';
import { CgUnavailable } from 'react-icons/cg';
import { setTokenA, setTokenB, setDidUserFlipDenom } from '../../../utils/state/tradeDataSlice';
import { Dispatch, SetStateAction, useState } from 'react';

import { useAppDispatch } from '../../../utils/hooks/reduxToolkit';
// import { TokenIF, TokenPairIF } from '../../../utils/interfaces/exports';
import { AiFillCloseSquare } from 'react-icons/ai';
import { TokenIF } from '../../../utils/interfaces/exports';
import { removeToken } from '../../Global/TokenSelectContainer/removeToken';
interface TokenSelectProps {
    token: TokenIF;
    tokensBank: Array<TokenIF>;
    chainId: string;
    setImportedTokens: Dispatch<SetStateAction<TokenIF[]>>;

    chooseToken: (tok: TokenIF) => void;
}

export default function TokenSelect(props: TokenSelectProps) {
    // const { token, tokenToUpdate, closeModal, tokenPair, reverseTokens } = props;
    const [showDelete, setShowDelete] = useState(false);
    const [toggleDeleteOn, setToggleDeleteOn] = useState(false);

    const dispatch = useAppDispatch();
    const { token, chooseToken } = props;

    const getRandomInt = () => Math.floor(Math.random() * 18000);

    const noTokenImage = <CgUnavailable size={20} />;

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

    const deleteIcon = (
        <div className={styles.close_icon} onClick={() => setShowDelete(true)}>
            <AiFillCloseSquare size={20} className={styles.close_icon_svg} />
        </div>
    );

    function handleToggleDelete() {
        if (toggleDeleteOn) {
            console.log('you have deleted this token');
            // functionality to delete from Emily's branch
            setShowDelete(false);
        } else {
            console.log('going back');
            setShowDelete(false);
        }
    }

    const toggleButtons = (
        <div className={styles.toggle_container}>
            <div className={styles.liqtype_buttons_container}>
                <button
                    className={toggleDeleteOn ? styles.active_button : styles.non_active_button}
                    onClick={() => setToggleDeleteOn(!toggleDeleteOn)}
                >
                    Yes
                </button>
                <button
                    className={!toggleDeleteOn ? styles.active_button : styles.non_active_button}
                    onClick={() => setToggleDeleteOn(!toggleDeleteOn)}
                >
                    No
                </button>
            </div>
            <div className={styles.confirm} onClick={() => handleToggleDelete()}>
                CONFIRM
            </div>
        </div>
    );

    console.log(toggleDeleteOn);

    const deleteStateStyle = !showDelete ? styles.delete_active : styles.delete_inactive;

    const deleteContainer = (
        <div className={`${styles.delete_container} ${deleteStateStyle}`}>
            Remove {token.symbol} from your list
            {toggleButtons}
        </div>
    );

    return (
        <div className={styles.main_container}>
            {deleteContainer}
            {starIcon}
            <div className={styles.modal_content} onClick={() => chooseToken(token)}>
                <div className={styles.modal_tokens_info}>
                    {token.logoURI ? <img src={token.logoURI} alt='' width='27px' /> : noTokenImage}
                    <span className={styles.modal_token_symbol}>{token.symbol}</span>
                    <span className={styles.modal_token_name}>{token.name}</span>
                </div>
                <div className={styles.modal_tokens_amount}>{getRandomInt()}</div>
            </div>
            {deleteIcon}
        </div>

        // return (
        //     <div className={styles.modal_content} onClick={() => chooseToken(token)}>
        //         <div className={styles.modal_tokens_info}>
        //             {starIcon}
        //             {token.logoURI ? <img src={token.logoURI} alt='' width='27px' /> : noTokenImage}
        //             <span className={styles.modal_token_symbol}>{token.symbol}</span>
        //             <span className={styles.modal_token_name}>{token.name}</span>
        //         </div>
        //         {deleteIcon}
        //     </div>
    );
}
