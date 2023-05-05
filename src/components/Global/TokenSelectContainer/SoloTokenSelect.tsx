import { useEffect, useMemo, useState, Dispatch, SetStateAction } from 'react';
import { useNavigate } from 'react-router-dom';
import { TokenIF, TokenPairIF } from '../../../utils/interfaces/exports';
import TokenSelect from '../TokenSelect/TokenSelect';
import { useAppDispatch } from '../../../utils/hooks/reduxToolkit';
import styles from './SoloTokenSelect.module.css';
import { memoizeFetchContractDetails } from '../../../App/functions/fetchContractDetails';
import { ethers } from 'ethers';
import SoloTokenImport from './SoloTokenImport';
import { useLocationSlug } from './hooks/useLocationSlug';
import { setSoloToken } from '../../../utils/state/soloTokenDataSlice';
import { ackTokensMethodsIF } from '../../../App/hooks/useAckTokens';
// import SimpleLoader from '../LoadingAnimations/SimpleLoader/SimpleLoader';
// import { AiOutlineQuestionCircle } from 'react-icons/ai';

interface propsIF {
    modalCloseCustom: () => void;
    provider: ethers.providers.Provider | undefined;
    importedTokensPlus: TokenIF[];
    chainId: string;
    closeModal: () => void;
    verifyToken: (addr: string, chn: string) => boolean;
    getTokensByName: (
        searchName: string,
        chn: string,
        exact: boolean,
    ) => TokenIF[];
    getTokenByAddress: (addr: string, chn: string) => TokenIF | undefined;
    showSoloSelectTokenButtons: boolean;
    setShowSoloSelectTokenButtons: Dispatch<SetStateAction<boolean>>;
    outputTokens: TokenIF[];
    validatedInput: string;
    setInput: Dispatch<SetStateAction<string>>;
    searchType: string;
    addRecentToken: (tkn: TokenIF) => void;
    getRecentTokens: (options?: {
        onCurrentChain?: boolean;
        count?: number | null;
    }) => TokenIF[];
    isSingleToken: boolean;
    tokenAorB: string | null;
    reverseTokens?: () => void;
    tokenPair?: TokenPairIF;
    ackTokens: ackTokensMethodsIF;
}

export const SoloTokenSelect = (props: propsIF) => {
    const {
        modalCloseCustom,
        provider,
        chainId,
        closeModal,
        verifyToken,
        setShowSoloSelectTokenButtons,
        showSoloSelectTokenButtons,
        outputTokens,
        validatedInput,
        setInput,
        searchType,
        addRecentToken,
        getRecentTokens,
        isSingleToken,
        tokenAorB,
        reverseTokens,
        tokenPair,
        ackTokens,
    } = props;

    // add an event listener for custom functionalities on modal close
    // this needs to be coordinated with data in Modal.tsx
    // later we'll abstract and import functionality to get rid of magic numbers
    useEffect(
        () => window.addEventListener('closeModalEvent', modalCloseCustom),
        [],
    );

    // instance of hook used to retrieve data from RTK
    const dispatch = useAppDispatch();

    // hook to produce current slug in URL prior to params
    const locationSlug = useLocationSlug();

    // fn to navigate the App to a new URL via react router
    // this will navigate the app while preserving state
    const navigate = useNavigate();

    // fn to respond to a user clicking to select a token
    const chooseToken = (tkn: TokenIF, isCustom: boolean): void => {
        if (isCustom) {
            ackTokens.acknowledge(tkn);
        }
        // dispatch token data object to RTK
        if (isSingleToken) {
            dispatch(setSoloToken(tkn));
        }

        // array of recent tokens from App.tsx (current session only)
        const recentTokens = getRecentTokens();
        // determine if clicked token is already in the recent tokens array
        // if not in recent tokens array, add it
        recentTokens.some(
            (recentToken: TokenIF) =>
                recentToken.address.toLowerCase() ===
                    tkn.address.toLowerCase() &&
                recentToken.chainId === tkn.chainId,
        ) || addRecentToken(tkn);

        if (tokenAorB === 'A' && tokenPair) {
            if (
                tokenPair.dataTokenB.address.toLowerCase() ===
                tkn.address.toLowerCase()
            ) {
                reverseTokens && reverseTokens();
                closeModal();
                return;
            }
            goToNewUrlParams(
                locationSlug,
                chainId,
                tkn.address,
                tokenPair.dataTokenB.address.toLowerCase() ===
                    tkn.address.toLowerCase()
                    ? tokenPair.dataTokenA.address
                    : tokenPair.dataTokenB.address,
            );
            // user is updating token B
        } else if (tokenAorB === 'B' && tokenPair) {
            if (
                tokenPair.dataTokenA.address.toLowerCase() ===
                tkn.address.toLowerCase()
            ) {
                reverseTokens && reverseTokens();
                closeModal();
                return;
            }
            goToNewUrlParams(
                locationSlug,
                chainId,
                tokenPair.dataTokenA.address.toLowerCase() ===
                    tkn.address.toLowerCase()
                    ? tokenPair.dataTokenB.address
                    : tokenPair.dataTokenA.address,
                tkn.address,
            );
        }

        function goToNewUrlParams(
            pathSlug: string,
            chain: string,
            addrTokenA: string,
            addrTokenB: string,
        ): void {
            navigate(
                pathSlug +
                    '/chain=' +
                    chain +
                    '&tokenA=' +
                    addrTokenA +
                    '&tokenB=' +
                    addrTokenB,
            );
        }

        setInput('');
        // close the token modal
        closeModal();
    };

    // hook to hold data for a token pulled from on-chain
    // null value is allowed to clear the hook when needed or on error
    const [customToken, setCustomToken] = useState<TokenIF | null>(null);
    useEffect(() => {
        // gatekeeping to pull token data from on-chain query
        // make sure a provider exists
        // validated input must appear to be a valid contract address
        // app must fail to find token in local data
        if (
            provider &&
            searchType === 'address' &&
            !verifyToken(validatedInput, chainId)
        ) {
            // local instance of function to pull back token data from chain
            const cachedFetchContractDetails = memoizeFetchContractDetails();
            // promise holding query to get token metadata from on-chain
            const promise: Promise<TokenIF | undefined> =
                cachedFetchContractDetails(provider, validatedInput, chainId);
            // resolve the promise
            Promise.resolve(promise)
                // if response has a `decimals` value treat it as valid
                .then(
                    (res: TokenIF | undefined) =>
                        res?.decimals && setCustomToken(res),
                )
                // error handling
                .catch((err) => {
                    // log error to console
                    console.error(err);
                    // set custom token as `null`
                    setCustomToken(null);
                });
        } else {
            // clear token data if conditions do not indicate necessity
            setCustomToken(null);
        }
        // run hook when validated input or type of search changes
        // searchType is redundant but may be relevant in the future
        // until then it does not hurt anything to put it there
    }, [searchType, validatedInput]);
    // EDS Test Token 2 address (please do not delete!)
    // '0x0B0322d75bad9cA72eC7708708B54e6b38C26adA'

    // value to determine what should be displayed in the DOM
    // this approach is necessary because not all data takes the same shape
    const contentRouter = useMemo<string>(() => {
        // declare an output variable for the hook
        let output: string;
        // router based on value of `validatedInput`
        // TODO: there must be a cleaner way of doing this, there is a specific
        // TODO: ... situation in which we need to show the user token data from
        // TODO: ... on-chain, in all other situations we just need token buttons
        switch (searchType) {
            case 'address':
                // pathway if input can be validated to a real extant token
                // can be in `allTokenLists` or in imported tokens list
                if (verifyToken(validatedInput, chainId)) {
                    output = 'token buttons';
                    // pathway if the address cannot be validated to any token in local storage
                } else {
                    output = 'from chain';
                }
                break;
            case 'nameOrSymbol':
            case '':
            default:
                output = 'token buttons';
        }
        // return output string
        return output;
        // run hook when validated input or type of search changes
        // searchType is redundant but may be relevant in the future
        // until then it does not hurt anything to put it there
    }, [validatedInput, searchType]);

    useEffect(() => {
        if (contentRouter === 'from chain') {
            setShowSoloSelectTokenButtons(false);
        } else {
            setShowSoloSelectTokenButtons(true);
        }
    }, [contentRouter]);

    const input = document.getElementById(
        'token_select_input_field',
    ) as HTMLInputElement;
    const clearInputField = () => {
        if (input) input.value = '';

        setInput('');
        document.getElementById('token_select_input_field')?.focus();
    };

    return (
        <section className={styles.container}>
            <div className={styles.input_control_container}>
                <input
                    id='token_select_input_field'
                    spellCheck='false'
                    type='text'
                    placeholder=' Search name or enter an Address'
                    onChange={(e) => setInput(e.target.value)}
                    style={{
                        color: showSoloSelectTokenButtons
                            ? 'var(--text1)'
                            : 'var(--text3)',
                    }}
                />
                {input?.value && (
                    <button
                        onClick={clearInputField}
                        aria-label='Clear input'
                        tabIndex={0}
                    >
                        Clear
                    </button>
                )}
            </div>
            {showSoloSelectTokenButtons ? (
                outputTokens.map((token: TokenIF) => (
                    <TokenSelect
                        key={JSON.stringify(token)}
                        token={token}
                        chooseToken={chooseToken}
                        fromListsText=''
                    />
                ))
            ) : (
                <SoloTokenImport
                    customToken={customToken}
                    chooseToken={chooseToken}
                    chainId={chainId}
                />
            )}
        </section>
    );
};
