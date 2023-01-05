// START: Import Local Files
import styles from './TokenSelect.module.css';
import { TokenIF } from '../../../utils/interfaces/exports';
import uriToHttp from '../../../utils/functions/uriToHttp';
import { useAppSelector } from '../../../utils/hooks/reduxToolkit';
import NoTokenIcon from '../NoTokenIcon/NoTokenIcon';

interface TokenSelectPropsIF {
    token: TokenIF;
    chooseToken: (tok: TokenIF) => void;
    fromListsText: string;
}

export default function TokenSelect(props: TokenSelectPropsIF) {
    const { token, chooseToken, fromListsText } = props;

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
                <section className={styles.left_side_container}>
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
