// START: Import React and Dongles
import { Dispatch, SetStateAction } from 'react';
import { useAppDispatch } from '../../../utils/hooks/reduxToolkit';

// START: Import Local Files
import { setTokenA, setTokenB, setDidUserFlipDenom } from '../../../utils/state/tradeDataSlice';
import styles from './TokenSelectContainer.module.css';
import TokenSelect from '../TokenSelect/TokenSelect';
import TokenSelectSearchable from '../TokenSelect/TokenSelectSearchable';
import { TokenIF, TokenPairIF } from '../../../utils/interfaces/exports';
import TokenList from '../../Global/TokenList/TokenList';
import { useSearch } from './useSearch';
import { importToken } from './importToken';

interface TokenSelectContainerPropsIF {
    tokenPair: TokenPairIF;
    tokensBank: Array<TokenIF>;
    setImportedTokens: Dispatch<SetStateAction<TokenIF[]>>;
    searchableTokens: Array<TokenIF>;
    tokenList?: Array<TokenIF>;
    chainId: string;
    tokenToUpdate: string;
    closeModal: () => void;
    reverseTokens: () => void;
    showManageTokenListContent: boolean;
    setShowManageTokenListContent: Dispatch<SetStateAction<boolean>>;
    activeTokenListsChanged: boolean;
    indicateActiveTokenListsChanged: Dispatch<SetStateAction<boolean>>;
}

export default function TokenSelectContainer(props: TokenSelectContainerPropsIF) {
    const {
        tokenPair,
        tokensBank,
        setImportedTokens,
        searchableTokens,
        chainId,
        tokenToUpdate,
        closeModal,
        reverseTokens,
        showManageTokenListContent,
        activeTokenListsChanged,
        indicateActiveTokenListsChanged,
    } = props;

    const dispatch = useAppDispatch();

    const [matchingImportedTokens, matchingSearchableTokens, setSearchInput] = useSearch(
        tokensBank,
        searchableTokens,
        chainId,
    );

    const importedTokensAddresses = tokensBank.map((token: TokenIF) => token.address);

    const chooseToken = (tok: TokenIF) => {
        if (tokenToUpdate === 'A') {
            if (tokenPair.dataTokenB.address === tok.address) {
                reverseTokens();
                dispatch(setTokenA(tok));
                dispatch(setTokenB(tokenPair.dataTokenA));
            } else {
                dispatch(setTokenA(tok));
                dispatch(setDidUserFlipDenom(false));
            }
        } else if (tokenToUpdate === 'B') {
            if (tokenPair.dataTokenA.address === tok.address) {
                reverseTokens();
                dispatch(setTokenB(tok));
                dispatch(setTokenA(tokenPair.dataTokenB));
            } else {
                dispatch(setTokenB(tok));
                dispatch(setDidUserFlipDenom(false));
            }
        } else {
            console.warn(
                'Error in TokenSelectContainer.tsx, failed to find proper dispatch function.',
            );
        }
        closeModal();
    };

    const tokenListContent = (
        <>
            <div className={styles.title}>YOUR TOKENS</div>
            <div className={styles.tokens_container}>
                {matchingImportedTokens.map((token: TokenIF, idx: number) => (
                    <TokenSelect
                        key={idx}
                        token={token}
                        chooseToken={chooseToken}
                        tokensBank={tokensBank}
                        chainId={chainId}
                        setImportedTokens={setImportedTokens}
                    />
                ))}
            </div>
            {matchingSearchableTokens.length ? (
                <h3 className={styles.search_tokens_title}>SEARCHED TOKENS</h3>
            ) : null}
            <div className={styles.token_select_searchable_container}>
                {matchingSearchableTokens
                    .filter((token: TokenIF) => !importedTokensAddresses.includes(token.address))
                    .map((tkn: TokenIF, idx: number) => (
                        <TokenSelectSearchable
                            key={`tss_${idx}`}
                            token={tkn}
                            clickHandler={() =>
                                importToken(tkn, tokensBank, setImportedTokens, () =>
                                    chooseToken(tkn),
                                )
                            }
                        />
                    ))}
            </div>
        </>
    );

    const tokenListContainer = (
        <>
            <div className={styles.search_input}>
                <input
                    type='text'
                    placeholder='Search name or paste address'
                    onChange={(event) => setSearchInput(event.target.value)}
                />
            </div>
            {tokenListContent}
        </>
    );

    return (
        <div className={styles.token_select_container}>
            {showManageTokenListContent ? (
                <TokenList
                    chainId={chainId}
                    activeTokenListsChanged={activeTokenListsChanged}
                    indicateActiveTokenListsChanged={indicateActiveTokenListsChanged}
                    tokenToUpdate={tokenToUpdate}
                    closeModal={closeModal}
                />
            ) : (
                tokenListContainer
            )}
        </div>
    );
}
