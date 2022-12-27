// START: Import React and Dongles
import { Dispatch, SetStateAction } from 'react';
// import { AiFillCloseSquare } from 'react-icons/ai';

// START: Import Local Files
import styles from './TokenSelect.module.css';
import { TokenIF } from '../../../utils/interfaces/exports';
import uriToHttp from '../../../utils/functions/uriToHttp';
import { useAppSelector } from '../../../utils/hooks/reduxToolkit';
import NoTokenIcon from '../NoTokenIcon/NoTokenIcon';
// import {BsPin, BsPinFill} from 'react-icons/bs'
interface TokenSelectPropsIF {
    token: TokenIF;
    tokensBank: Array<TokenIF>;
    chainId: string;
    setImportedTokens: Dispatch<SetStateAction<TokenIF[]>>;
    chooseToken: (tok: TokenIF) => void;
    isOnPortfolio?: boolean;
    fromListsText: string;
}

export default function TokenSelect(props: TokenSelectPropsIF) {
    const {
        token,
        chooseToken,
        // tokensBank,
        // chainId,
        // setImportedTokens,
        fromListsText,
    } = props;

    const userData = useAppSelector((state) => state.userData);

    const connectedUserNativeToken = userData.tokens.nativeToken;
    const connectedUserErc20Tokens = userData.tokens.erc20Tokens;
    const isUserLoggedIn = userData.isLoggedIn;

    const connectedUserTokens = connectedUserNativeToken
        ? [connectedUserNativeToken].concat(connectedUserErc20Tokens || [])
        : connectedUserErc20Tokens;

    const isMatchingToken = (tokenInRtk: TokenIF) =>
        tokenInRtk.address.toLowerCase() === token.address.toLowerCase();

    const indexOfToken = connectedUserTokens ? connectedUserTokens.findIndex(isMatchingToken) : -1;

    const tokenIsEth = indexOfToken === 0;

    const combinedBalanceDisplayTruncated =
        connectedUserTokens && indexOfToken !== -1
            ? connectedUserTokens[indexOfToken]?.combinedBalanceDisplayTruncated
            : undefined;

    return (
        <>
            <div className={styles.main_container} onClick={() => chooseToken(token)}>
                {
                    // <div className={`${styles.delete_container} ${deleteStateStyle}`}>
                    //     Remove {token.symbol} from your list
                    //     {toggleButtons}
                    // </div>
                }
                <section className={styles.left_side_container}>
                    {/* <div className={styles.star_icon}>{starIcon}</div> */}
                    {/* <div onClick={() => setPinned(!pinned)}>{ pinned ? <BsPinFill/> : <BsPin  />}</div> */}

                    <div className={styles.modal_content}>
                        <div className={styles.modal_tokens_info}>
                            {token.logoURI ? (
                                <img
                                    src={uriToHttp(token.logoURI)}
                                    alt={token.symbol.charAt(0)}
                                    // alt={`logo for token ${token.name}`}
                                    width='27px'
                                />
                            ) : (
                                <NoTokenIcon tokenInitial={token.symbol.charAt(0)} width='27px' />
                            )}
                            <div className={styles.name_container}>
                                <span className={styles.modal_token_symbol}>{token.symbol}</span>
                                <span className={styles.modal_token_name}>{token.name}</span>
                            </div>
                        </div>
                    </div>
                </section>

                <div className={styles.modal_tokens_amount}>
                    <p>
                        {isUserLoggedIn
                            ? combinedBalanceDisplayTruncated === undefined
                                ? connectedUserErc20Tokens !== undefined
                                    ? '0'
                                    : '...'
                                : tokenIsEth && parseFloat(combinedBalanceDisplayTruncated) === 0
                                ? '0'
                                : combinedBalanceDisplayTruncated
                            : ''}
                    </p>
                    <p className={styles.token_list_data}>{fromListsText}</p>
                </div>
            </div>
            {/* <p className={styles.token_list_data}>{fromListsText}</p> */}
        </>
    );
}
