// START: Import React and Dongles
import { Dispatch, SetStateAction, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// START: Import Local Files
import styles from './TokenSelectContainer.module.css';
import TokenSelect from '../TokenSelect/TokenSelect';
import TokenSelectSearchable from '../TokenSelect/TokenSelectSearchable';
import { TokenIF, TokenPairIF, TokenListIF } from '../../../utils/interfaces/exports';
import TokenList from '../../Global/TokenList/TokenList';
import { useSearch } from './useSearch';
import { importToken } from './importToken';

interface TokenSelectContainerPropsIF {
    resetTokenQuantities?: () => void;
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
        resetTokenQuantities,
        tokenPair,
        tokensBank,
        setImportedTokens,
        searchableTokens,
        chainId,
        tokenToUpdate,
        closeModal,
        showManageTokenListContent,
        activeTokenListsChanged,
        indicateActiveTokenListsChanged,
    } = props;

    const navigate = useNavigate();

    const undeletableTokens = useMemo(
        () =>
            JSON.parse(localStorage.getItem('allTokenLists') as string)
                .find((tokenList: TokenListIF) => tokenList.uri === '/ambient-token-list.json')
                .tokens.map((tkn: TokenIF) => tkn.address),
        [],
    );

    const [matchingImportedTokens, matchingSearchableTokens, setSearchInput] = useSearch(
        tokensBank,
        searchableTokens,
        chainId,
    );

    const importedTokensAddresses = tokensBank.map((token: TokenIF) => token.address);

    const location = useLocation();

    const locationSlug = useMemo<string>(() => {
        const { pathname } = location;
        if (pathname.startsWith('/trade/market')) {
            return '/trade/market';
        } else if (pathname.startsWith('/trade/limit')) {
            return '/trade/limit';
        } else if (pathname.startsWith('/trade/range')) {
            return '/trade/range';
        } else if (pathname.startsWith('/swap')) {
            return '/swap';
        }
    }, [location]);

    const chooseToken = (tok: TokenIF) => {
        // function to generate the URL string for navigation
        const makeUrlParams = (
            pathSlug: string,
            chain: string,
            addrTokenA: string,
            addrTokenB: string
        ) => (
            pathSlug + '/chain=' + chain + '&tokenA=' + addrTokenA + '&tokenB=' + addrTokenB
        );

        // user is updating token A
        if (tokenToUpdate === 'A') {
            // user selected current token B, need to reverse tokens
            if (tokenPair.dataTokenB.address === tok.address) {
                // clicked token is Token A
                // previous token A is used for Token B
                // const newURLParams = `/chain=0x5&tokenA=${tok.address}&tokenB=${tokenPair.dataTokenA.address}`;
                // navigate(locationSlug + newURLParams);
                navigate(
                    makeUrlParams(
                        locationSlug,
                        '0x5',
                        tok.address,
                        tokenPair.dataTokenA.address
                    )
                );
            // user selected an entirely new for token A
            } else {
                // clicked token is Token A
                // current token B is still Token B
                // const newURLParams = `/chain=0x5&tokenA=${tok.address}&tokenB=${tokenPair.dataTokenB.address}`;
                // navigate(locationSlug + newURLParams);
                navigate(
                    makeUrlParams(
                        locationSlug,
                        '0x5',
                        tok.address,
                        tokenPair.dataTokenB.address
                    )
                );
            }
        // user is updating token B
        } else if (tokenToUpdate === 'B') {
            if (tokenPair.dataTokenA.address === tok.address) {
                // clicked token is Token B
                // previous Token B is now Token A
                // const newURLParams = `/chain=0x5&tokenA=${tokenPair.dataTokenB.address}&tokenB=${tok.address}`;
                // navigate(locationSlug + newURLParams);
                navigate(
                    makeUrlParams(
                        locationSlug,
                        '0x5',
                        tokenPair.dataTokenB.address,
                        tok.address
                    )
                );
            } else {
                // clicked token is Token B
                // current token A is still Token A
                // const newURLParams = `/chain=0x5&tokenA=${tokenPair.dataTokenA.address}&tokenB=${tok.address}`;
                // navigate(locationSlug + newURLParams);
                navigate(
                    makeUrlParams(
                        locationSlug,
                        '0x5',
                        tokenPair.dataTokenA.address,
                        tok.address
                    )
                );
            }
        } else {
            console.warn(
                'Error in TokenSelectContainer.tsx, failed to find proper dispatch function.',
            );
        }

        resetTokenQuantities ? resetTokenQuantities() : null;
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
                        undeletableTokens={undeletableTokens}
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
                    undeletableTokens={undeletableTokens}
                    closeModal={closeModal}
                />
            ) : (
                tokenListContainer
            )}
        </div>
    );
}
