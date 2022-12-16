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
// import { AiOutlineQuestionCircle } from 'react-icons/ai';

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
        getTokensByName,
        getTokenByAddress,
        verifyToken
    } = props;

    // hook to process search input and return an array of relevant tokens
    // also returns state setter function and values for control flow
    const [outputTokens, validatedInput, setInput, searchType] = useSoloSearch(
        chainId,
        importedTokens,
        verifyToken,
        getTokenByAddress,
        getTokensByName
    );

    // instance of hook used to retrieve data from RTK
    const dispatch = useAppDispatch();

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
            undeletableTokens={[]}
            chainId={chainId}
            setImportedTokens={setImportedTokens}
            chooseToken={chooseToken}
            isOnPortfolio={true}
            fromListsText=''
        />
    ));

    const [customToken, setCustomToken] = useState<TokenIF | null>(null);
    useEffect(() => {
        // gatekeeping to pull token data from on-chain query
        // make sure a provider exists
        // validated input must appear to be a valid contract address
        // app must fail to find token in local data
        if (provider && searchType === 'address' && !verifyToken(validatedInput, chainId)) {
            const cachedFetchContractDetails = memoizeFetchContractDetails();
            const promise = cachedFetchContractDetails(provider, validatedInput, chainId);
            Promise.resolve(promise)
                .then((res) => res?.decimals && setCustomToken(res))
                .catch((err) => {
                    console.warn(err);
                    setCustomToken(null);
                });
        } else {
            setCustomToken(null);
        }
    }, [searchType, validatedInput]);
    // EDS Test Token 2 address (please do not delete!)
    // '0x0B0322d75bad9cA72eC7708708B54e6b38C26adA'

    const contentRouter = useMemo(() => {
        let output: string;
        if (validatedInput) {
            if (searchType === 'address') {
                if (
                    verifyToken(validatedInput, chainId) ||
                    JSON.parse(localStorage.getItem('user') as string).tokens
                        .some((tkn: TokenIF) => (
                            tkn.address.toLowerCase() === validatedInput.toLowerCase()
                        ))
                ) {
                    output = 'token buttons';
                } else {
                    output = 'from chain';
                }
            } else if (searchType === 'nameOrSymbol') {
                output = 'token buttons';
            } else {
                output = 'token buttons';
            }
        } else {
            output = 'token buttons';
        }
        return output;
    }, [validatedInput, searchType]);

    // TODO: find the control flow to put this in the DOM
    // const tokenNotFound = (
    //     <div className={styles.token_not_found}>
    //         <p>Cound not find matching token</p>
    //         <AiOutlineQuestionCircle />
    //     </div>
    // );

    return (
        <section className={styles.container}>
            <input
                spellCheck={'false'}
                type='text'
                placeholder='&#61442; Search name or enter an Address'
                onChange={(e) => setInput(e.target.value)}
            />
            {contentRouter === 'token buttons' && tokenButtons}
            {contentRouter === 'from chain' &&
            <SoloTokenImport customToken={customToken} chooseToken={chooseToken} />
            }
        </section>
    );
};
