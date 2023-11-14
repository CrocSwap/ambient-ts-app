// START: Import Local Files
import styles from './TokenSelect.module.css';
import { TokenIF } from '../../../utils/interfaces/exports';
import { useAppSelector } from '../../../utils/hooks/reduxToolkit';
import TokenIcon from '../TokenIcon/TokenIcon';
import { BigNumber } from 'ethers';
import { toDisplayQty } from '@crocswap-libs/sdk';
import { getFormattedNumber } from '../../../App/functions/getFormattedNumber';

interface propsIF {
    token: TokenIF;
    chooseToken: (tok: TokenIF, isCustom: boolean) => void;
    fromListsText: string;
}

export default function TokenSelect(props: propsIF) {
    const { token, chooseToken, fromListsText } = props;

    const userData = useAppSelector((state) => state.userData);

    const connectedUserTokens = userData.tokenBalances;
    const isUserLoggedIn = userData.isLoggedIn;

    const isMatchingToken = (tokenInRtk: TokenIF) =>
        tokenInRtk.address.toLowerCase() === token.address.toLowerCase();

    const indexOfToken = connectedUserTokens
        ? connectedUserTokens.findIndex(isMatchingToken)
        : -1;

    const combinedBalance =
        connectedUserTokens && indexOfToken !== -1
            ? BigNumber.from(
                  connectedUserTokens[indexOfToken].walletBalance ?? '0',
              )
                  .add(
                      BigNumber.from(
                          connectedUserTokens[indexOfToken].dexBalance ?? '0',
                      ),
                  )
                  .toString()
            : undefined;

    const combinedBalanceDisplay =
        combinedBalance && connectedUserTokens
            ? toDisplayQty(
                  combinedBalance,
                  connectedUserTokens[indexOfToken]?.decimals,
              )
            : undefined;

    const combinedBalanceDisplayNum = parseFloat(combinedBalanceDisplay ?? '0');

    const combinedBalanceDisplayTruncated = combinedBalanceDisplayNum
        ? getFormattedNumber({
              value: combinedBalanceDisplayNum,
          })
        : '0';

    return (
        <button
            id={`token_select_button_${token.address}`}
            className={styles.main_container}
            onClick={() => chooseToken(token, false)}
            role='button'
            tabIndex={0}
            aria-label={`Select ${token.symbol}`}
        >
            <section className={styles.left_side_container}>
                <div className={styles.modal_content}>
                    <div className={styles.modal_tokens_info}>
                        <TokenIcon
                            token={token}
                            src={token.logoURI}
                            alt={token.symbol}
                            size='xl'
                        />
                        <div className={styles.name_container}>
                            <span className={styles.modal_token_symbol}>
                                {token.symbol}
                            </span>
                            <span className={styles.modal_token_name}>
                                {token.name}
                            </span>
                        </div>
                    </div>
                </div>
            </section>
            <div className={styles.modal_tokens_amount}>
                <p>
                    {isUserLoggedIn
                        ? connectedUserTokens !== undefined
                            ? combinedBalanceDisplayNum === 0
                                ? '0'
                                : combinedBalanceDisplayTruncated
                            : '...'
                        : ''}
                </p>
                <p className={styles.token_list_data}>{fromListsText}</p>
            </div>
        </button>
    );
}
