import { useEffect, useMemo, useState, Dispatch, SetStateAction } from 'react';
import { TokenListIF, TokenIF } from '../../../utils/interfaces/exports';
import TokenSelect from '../TokenSelect/TokenSelect';
import { useAppDispatch } from '../../../utils/hooks/reduxToolkit';
import { setToken } from '../../../utils/state/temp';
import { useSoloSearch } from './useSoloSearch';
import styles from './SoloTokenSelect.module.css';
import { memoizeFetchContractDetails } from '../../../App/functions/fetchContractDetails';
import { ethers } from 'ethers';
import SoloTokenImport from './SoloTokenImport';
import { AiOutlineQuestionCircle } from 'react-icons/ai';

interface propsIF {
    provider: ethers.providers.Provider | undefined;
    importedTokens: TokenIF[];
    chainId: string;
    setImportedTokens: Dispatch<SetStateAction<TokenIF[]>>;
    // TODO: rewrite logic to build this Map from all lists not just active ones
    tokensOnActiveLists: Map<string, TokenIF>;
    closeModal: () => void;
    verifyToken: (addr: string, chn: string) => boolean;
    getTokensOnChain: (chn: string) => TokenIF[];
    getTokensByName: (searchName: string, chn: string, exact: boolean) => TokenIF[];
    getTokenByAddress: (addr: string, chn: string) => TokenIF | undefined;
}

export const SoloTokenSelect = (props: propsIF) => {
    const {
        provider,
        importedTokens,
        chainId,
        setImportedTokens,
        closeModal,
        // getTokensOnChain,
        getTokensByName,
        getTokenByAddress,
        verifyToken
    } = props;
    console.log(importedTokens);

    const [outputTokens, validatedInput, setInput, searchType] = useSoloSearch(
        chainId,
        importedTokens,
        verifyToken,
        getTokenByAddress,
        getTokensByName
    );

    useEffect(() => console.log(outputTokens), [outputTokens]);

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

    const tokenButtons = outputTokens.map((token: TokenIF) => (
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
    ));

    const [customToken, setCustomToken] = useState<TokenIF | null>(null);
    useEffect(() => {
        if (provider && searchType === 'address' && !outputTokens.length) {
            const cachedFetchContractDetails = memoizeFetchContractDetails();
            const promise = cachedFetchContractDetails(provider, validatedInput, chainId);
            Promise.resolve(promise)
                .then((res) => res && setCustomToken(res))
                .catch((err) => {
                    console.warn(err);
                    setCustomToken(null);
                });
        }
    }, [searchType, validatedInput]);
    // EDS Test Token 2 address (please do not delete!)
    // '0x0B0322d75bad9cA72eC7708708B54e6b38C26adA'

    const tokenNotFound = (
        <div className={styles.token_not_found}>
            <p>Cound not find matching token</p>
            <AiOutlineQuestionCircle />
        </div>
    );

    useEffect(() => console.log(outputTokens), [outputTokens]);

    const figureOutWhatToShow = () => {
        let showThis: string;
        console.log(searchType);
        console.log({validatedInput});
        if (validatedInput) {
            if (outputTokens.length) {
                console.log('case 1');
                showThis = 'token buttons';
            } else {
                if (customToken) {
                    if (searchType === 'address') {
                        console.log('case 2');
                        showThis = 'custom token';
                    } else {
                        console.log('case 3');
                        showThis = 'not found';
                    }
                } else {
                    console.log('case 4');
                    showThis = 'not found';
                }
            }
        } else {
            console.log('case 5');
            showThis = 'token buttons';
        }
        console.log({showThis});
        return showThis;
    }
    const whatToShow = figureOutWhatToShow();

    return (
        <section className={styles.container}>
            <input
                spellCheck={'false'}
                type='text'
                placeholder='&#61442; Search name or enter an Address'
                onChange={(e) => setInput(e.target.value)}
            />
            {whatToShow === 'token buttons' && tokenButtons}
            {whatToShow === 'custom token' &&
                <SoloTokenImport customToken={customToken} chooseToken={chooseToken} />
            }
            {whatToShow === 'not found' && tokenNotFound}

        </section>
    );
};
