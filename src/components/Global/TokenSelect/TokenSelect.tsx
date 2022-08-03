// START: Import React and Dongles
import { Dispatch, SetStateAction, useState } from 'react';
import { AiFillCloseSquare } from 'react-icons/ai';
import { CgUnavailable } from 'react-icons/cg';
import { contractAddresses, toDisplayQty } from '@crocswap-libs/sdk';

// START: Import Local Files
import styles from './TokenSelect.module.css';
import { TokenIF } from '../../../utils/interfaces/exports';
import uriToHttp from '../../../utils/functions/uriToHttp';
import clickStar from './clickStar';
import { removeToken } from '../../Global/TokenSelectContainer/removeToken';
import { useAppSelector } from '../../../utils/hooks/reduxToolkit';

interface TokenSelectPropsIF {
    token: TokenIF;
    tokensBank: Array<TokenIF>;
    undeletableTokens: Array<string>;
    chainId: string;
    setImportedTokens: Dispatch<SetStateAction<TokenIF[]>>;
    chooseToken: (tok: TokenIF) => void;
}

export default function TokenSelect(props: TokenSelectPropsIF) {
    const {
        token,
        chooseToken,
        tokensBank,
        undeletableTokens,
        chainId,
        setImportedTokens
    } = props;
    const [showDelete, setShowDelete] = useState(false);
    const [toggleDeleteOn, setToggleDeleteOn] = useState(false);

    const tokensInRTK = useAppSelector((state) => state.tokenData.tokens);

    const getTokenBalance = (address: string) => {
        let tokenBalanceDisplay = '';
        tokensInRTK.map((token) => {
            if (token.token_address?.toLowerCase() === address.toLowerCase()) {
                if (token.balance && token.decimals) {
                    if (token.address === contractAddresses.ZERO_ADDR) {
                        const localizedNativeBalance = parseFloat(token.balance).toLocaleString('en-US');
                        tokenBalanceDisplay = localizedNativeBalance;
                        return;
                    }
                    const untruncatedDisplayQty = toDisplayQty(token.balance, token.decimals);
                    const displayQtyNum = parseFloat(untruncatedDisplayQty);
                    const localDisplayQty = displayQtyNum.toLocaleString('en-US');
                    tokenBalanceDisplay = localDisplayQty;
                }
            }
        });
        return tokenBalanceDisplay;
    };

    const noTokenImage = <CgUnavailable size={20} />;

    // As much as I dislike directing using svgs in code, this is the only way we can style the fill on hover...unless we want to bring in two different SVGS.
    const starIcon = (
        <svg
            width='23'
            height='23'
            viewBox='0 0 23 23'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
            onClick={() => clickStar()}
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
    );

    const deleteIcon = (
        <div className={styles.close_icon} onClick={() => setShowDelete(true)}>
            <AiFillCloseSquare size={20} className={styles.close_icon_svg} />
        </div>
    );

    function handleToggleDelete() {
        if (toggleDeleteOn) removeToken(token, tokensBank, chainId, setImportedTokens);
        setShowDelete(false);
    }

    const confirmStyle = toggleDeleteOn ? styles.danger_style : styles.primary_style;

    const toggleButtons = (
        <div className={styles.toggle_container}>
            <div className={styles.liqtype_buttons_container}>
                <button
                    className={!toggleDeleteOn ? styles.active_button : styles.non_active_button}
                    onClick={() => setToggleDeleteOn(!toggleDeleteOn)}
                >
                    No
                </button>
                <button
                    className={toggleDeleteOn ? styles.active_button : styles.non_active_button}
                    onClick={() => setToggleDeleteOn(!toggleDeleteOn)}
                >
                    Yes
                </button>
            </div>
            <div
                className={`${styles.confirm} ${confirmStyle}`}
                onClick={() => handleToggleDelete()}
            >
                {toggleDeleteOn ? 'REMOVE' : 'CANCEL'}
            </div>
        </div>
    );

    const deleteStateStyle = !showDelete ? styles.delete_active : styles.delete_inactive;

    return (
        <div className={styles.main_container}>
            <div className={`${styles.delete_container} ${deleteStateStyle}`}>
                Remove {token.symbol} from your list
                {toggleButtons}
            </div>
            <div className={styles.star_icon}>{starIcon}</div>
            <div className={styles.modal_content} onClick={() => chooseToken(token)}>
                <div className={styles.modal_tokens_info}>
                    {token.logoURI ? (
                        <img
                            src={uriToHttp(token.logoURI)}
                            alt={`logo for token ${token.name}`}
                            width='27px'
                        />
                    ) : (
                        noTokenImage
                    )}
                    <span className={styles.modal_token_symbol}>{token.symbol}</span>
                    <span className={styles.modal_token_name}>{token.name}</span>
                </div>
                <div className={styles.modal_tokens_amount}>{getTokenBalance(token.address)}</div>
            </div>
            {undeletableTokens.includes(token.address) || deleteIcon}
        </div>
    );
}
