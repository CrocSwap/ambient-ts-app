import { toDisplayQty } from '@crocswap-libs/sdk';
import { useContext } from 'react';
import { getFormattedNumber } from '../../../ambient-utils/dataLayer';
import { TokenIF } from '../../../ambient-utils/types';
import { TokenBalanceContext } from '../../../contexts/TokenBalanceContext';
import { UserDataContext } from '../../../contexts/UserDataContext';
import TokenIcon from '../TokenIcon/TokenIcon';
import styles from './TokenSelect.module.css';
import { useBottomSheet } from '../../../contexts/BottomSheetContext';

interface propsIF {
    token: TokenIF;
    chooseToken: (tok: TokenIF, isCustom: boolean) => void;
    fromListsText: string;
}

export default function TokenSelect(props: propsIF) {
    const { isBottomSheetOpen, closeBottomSheet } = useBottomSheet();

    const { token, chooseToken, fromListsText } = props;

    const { isUserConnected } = useContext(UserDataContext);
    const { tokenBalances } = useContext(TokenBalanceContext);

    const isMatchingToken = (tokenInBalances: TokenIF) =>
        tokenInBalances.address.toLowerCase() === token.address.toLowerCase();

    const indexOfToken = tokenBalances
        ? tokenBalances.findIndex(isMatchingToken)
        : -1;

    const combinedBalance =
        tokenBalances && indexOfToken !== -1
            ? (
                  BigInt(tokenBalances[indexOfToken].walletBalance ?? '0') +
                  BigInt(tokenBalances[indexOfToken].dexBalance ?? '0')
              ).toString()
            : undefined;

    const combinedBalanceDisplay =
        combinedBalance && tokenBalances
            ? toDisplayQty(
                  combinedBalance,
                  tokenBalances[indexOfToken]?.decimals,
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
            onClick={() => {
                chooseToken(token, false);
                if (isBottomSheetOpen) {
                    closeBottomSheet();
                }
            }}
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
                    {isUserConnected && combinedBalanceDisplay !== undefined
                        ? tokenBalances !== undefined
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
