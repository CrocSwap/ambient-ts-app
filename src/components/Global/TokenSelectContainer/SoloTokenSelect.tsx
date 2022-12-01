import { useMemo, useState, Dispatch, SetStateAction, useEffect } from 'react';
import { TokenListIF, TokenIF } from '../../../utils/interfaces/exports';
import TokenSelect from '../TokenSelect/TokenSelect';
import { useAppDispatch } from '../../../utils/hooks/reduxToolkit';
import { setToken } from '../../../utils/state/temp';
import { useSoloSearch } from './useSoloSearch';
import styles from './SoloTokenSelect.module.css';
import { memoizeFetchContractDetails } from '../../../App/functions/fetchContractDetails';
import { ethers } from 'ethers';
import SoloTokenImport from './SoloTokenImport';

interface propsIF {
    provider: ethers.providers.Provider | undefined;
    importedTokens: TokenIF[];
    chainId: string;
    setImportedTokens: Dispatch<SetStateAction<TokenIF[]>>;
    tokensOnActiveLists: Map<string, TokenIF>;
    closeModal: () => void;
    searchableTokens: TokenIF[];
}

export const SoloTokenSelect = (props: propsIF) => {
    const {
        provider,
        importedTokens,
        chainId,
        setImportedTokens,
        closeModal,
        tokensOnActiveLists,
        searchableTokens
    } = props;
    false && searchableTokens;

    const [tokensForDOM, otherTokensForDOM, validatedInput, setInput, searchType] = useSoloSearch(
        chainId,
        importedTokens,
        tokensOnActiveLists,
    );

    const dispatch = useAppDispatch();

    const undeletableTokens = useMemo(
        () =>
            JSON.parse(localStorage.getItem('allTokenLists') as string)
                .find((tokenList: TokenListIF) => tokenList.uri === '/ambient-token-list.json')
                .tokens.map((tkn: TokenIF) => tkn.address),
        [],
    );

    const chooseToken = (tkn: TokenIF) => {
        dispatch(setToken(tkn));
        const isTokenImported = importedTokens.some(
            (tk: TokenIF) => tk.address.toLowerCase() === tkn.address.toLowerCase(),
        );
        if (!isTokenImported) {
            const userData = JSON.parse(localStorage.getItem('user') as string);
            userData.tokens = [...importedTokens, tkn];
            localStorage.setItem('user', JSON.stringify(userData));
            setImportedTokens([...importedTokens, tkn]);
        }
        closeModal();
    };

    const importedTokenButtons = tokensForDOM
        ? tokensForDOM.map((token: TokenIF) => (
            <TokenSelect
                key={JSON.stringify(token)}
                token={token}
                tokensBank={importedTokens}
                undeletableTokens={undeletableTokens}
                chainId={chainId}
                setImportedTokens={setImportedTokens}
                chooseToken={chooseToken}
                isOnPortfolio={true}
                fromListsText='Imported'
            />
        ))
        : null;

    const findDupes = (addr: string) => {
        const allTokenLists = JSON.parse(localStorage.getItem('allTokenLists') as string);
        const listNames = allTokenLists
            .filter((tokenList: TokenListIF) =>
                tokenList.tokens.some(
                    (token: TokenIF) => token.address.toLowerCase() === addr.toLowerCase(),
                ),
            )
            .map((tokenList: TokenListIF) => tokenList.name);
        let outputMessage = '';
        if (listNames.length > 2) {
            outputMessage = `from ${listNames[0]}, ${listNames[1]}, and ${
                listNames.length - 2
            } more`;
        } else if (listNames.length === 2) {
            outputMessage = `from ${listNames[0]} and ${listNames[1]}`;
        } else if (listNames.length === 1) {
            outputMessage = `from ${listNames[0]}`;
        } else {
            console.warn(
                'Could not find a valid array length for listNames in fn findDupes() in SoloTokenSelect.tsx file. Will return empty string. Please troubleshoot.',
            );
            outputMessage = '';
        }
        return outputMessage;
    };

    const otherTokenButtons = otherTokensForDOM
        ? otherTokensForDOM.map((token: TokenIF) => (
            <TokenSelect
                key={JSON.stringify(token)}
                token={token}
                tokensBank={importedTokens}
                undeletableTokens={undeletableTokens}
                chainId={chainId}
                setImportedTokens={setImportedTokens}
                chooseToken={chooseToken}
                isOnPortfolio={true}
                fromListsText={findDupes(token.address)}
            />
        ))
        : null;

    const [customToken, setCustomToken] = useState<TokenIF | null>(null);
    useEffect(() => {
        if (provider && searchType === 'address' && !otherTokensForDOM?.length) {
            const cachedFetchContractDetails = memoizeFetchContractDetails();
            const promise = cachedFetchContractDetails(provider, validatedInput, chainId);
            Promise.resolve(promise)
                .then((res) => res && setCustomToken(res))
                .catch((err) => {
                    console.log(err);
                    setCustomToken(null);
                });
        }
    }, [searchType, validatedInput]);
    // EDS Test Token 2 address (please do not delete!)
    // '0x0B0322d75bad9cA72eC7708708B54e6b38C26adA'

    return (
        <section className={styles.container}>
            <input
                spellCheck={'false'}
                type='text'
                placeholder='&#61442; Search name or enter an Address'
                onChange={(e) => setInput(e.target.value)}
            />
            {!searchType ? importedTokenButtons : null}
            {searchType && otherTokensForDOM?.length ? (
                <>
                    <h2>More Available Tokens</h2>
                    <div className={styles.scrollable_container}>{otherTokenButtons}</div>
                </>
            ) : null}
            {searchType === 'address' && otherTokensForDOM?.length === 0 ? (
                <SoloTokenImport
                    customToken={customToken}
                    chooseToken={chooseToken}
                />
            ) : null}
        </section>
    );
};
