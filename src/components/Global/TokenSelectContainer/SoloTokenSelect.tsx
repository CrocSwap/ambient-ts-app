import {
    useEffect,
    useMemo,
    useState,
    Dispatch,
    SetStateAction,
    useContext,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { TokenIF } from '../../../utils/interfaces/exports';
import TokenSelect from '../TokenSelect/TokenSelect';
import {
    useAppDispatch,
    useAppSelector,
} from '../../../utils/hooks/reduxToolkit';
import styles from './SoloTokenSelect.module.css';
import { memoizeFetchContractDetails } from '../../../App/functions/fetchContractDetails';
import SoloTokenImport from './SoloTokenImport';
import { useLocationSlug } from './hooks/useLocationSlug';
import { setSoloToken } from '../../../utils/state/soloTokenDataSlice';
import { CrocEnvContext } from '../../../contexts/CrocEnvContext';
import { useProvider } from 'wagmi';
import { ethers } from 'ethers';
import { TokenContext } from '../../../contexts/TokenContext';

interface propsIF {
    modalCloseCustom: () => void;
    closeModal: () => void;
    showSoloSelectTokenButtons: boolean;
    setShowSoloSelectTokenButtons: Dispatch<SetStateAction<boolean>>;
    isSingleToken: boolean;
    tokenAorB: string | null;
    reverseTokens?: () => void;
}

export const SoloTokenSelect = (props: propsIF) => {
    const {
        modalCloseCustom,
        closeModal,
        setShowSoloSelectTokenButtons,
        showSoloSelectTokenButtons,
        isSingleToken,
        tokenAorB,
        reverseTokens,
    } = props;

    const {
        chainData: { chainId },
    } = useContext(CrocEnvContext);
    const {
        tokens,
        outputTokens,
        validatedInput,
        setInput,
        searchType,
        addRecentToken,
        getRecentTokens,
    } = useContext(TokenContext);

    const { tokenA, tokenB } = useAppSelector((state) => state.tradeData);

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

    const provider = useProvider();

    // fn to respond to a user clicking to select a token
    const chooseToken = (tkn: TokenIF, isCustom: boolean): void => {
        if (isCustom) {
            tokens.ackToken(tkn);
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

        if (tokenAorB === 'A') {
            if (tokenB.address.toLowerCase() === tkn.address.toLowerCase()) {
                reverseTokens && reverseTokens();
                closeModal();
                return;
            }
            goToNewUrlParams(
                locationSlug,
                chainId,
                tkn.address,
                tokenB.address.toLowerCase() === tkn.address.toLowerCase()
                    ? tokenA.address
                    : tokenB.address,
            );
            // user is updating token B
        } else if (tokenAorB === 'B') {
            if (tokenA.address.toLowerCase() === tkn.address.toLowerCase()) {
                reverseTokens && reverseTokens();
                closeModal();
                return;
            }
            goToNewUrlParams(
                locationSlug,
                chainId,
                tokenA.address.toLowerCase() === tkn.address.toLowerCase()
                    ? tokenB.address
                    : tokenA.address,
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
    const [customToken, setCustomToken] = useState<TokenIF | null | 'querying'>(
        null,
    );
    // Memoize the fetch contract details function
    const cachedFetchContractDetails = useMemo(
        () => memoizeFetchContractDetails(),
        [],
    );

    // Gatekeeping to pull token data from on-chain query
    // Runs hook when validated input or type of search changes
    useEffect(() => {
        // Ignore for modes outside address search
        if (searchType !== 'address') {
            setCustomToken(null);
            return;
        }

        // If token address is on list, fill in immediately
        if (
            provider &&
            searchType === 'address' &&
            tokens.getTokenByAddress(validatedInput)
        ) {
            setCustomToken(null);
            return;
        }

        // Otherwise, query to get token metadata from on-chain
        setCustomToken('querying');
        cachedFetchContractDetails(
            provider as ethers.providers.Provider,
            validatedInput,
            chainId,
        )
            .then((res) => {
                // If response has a `decimals` value, treat it as valid
                if (res?.decimals) {
                    setCustomToken(res);
                } else {
                    // Handle error in a more meaningful way
                    throw new Error(
                        'Token metadata is invalid: ' + validatedInput,
                    );
                }
            })
            .catch((err) => {
                // Handle error
                console.error(`Failed to get token metadata: ${err.message}`);
                setCustomToken(null);
            });
    }, [searchType, validatedInput, provider, cachedFetchContractDetails]);
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
                if (tokens.verifyToken(validatedInput)) {
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
