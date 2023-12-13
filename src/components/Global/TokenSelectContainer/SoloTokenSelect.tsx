import {
    useEffect,
    useMemo,
    useState,
    Dispatch,
    SetStateAction,
    useContext,
} from 'react';
import { TokenIF } from '../../../ambient-utils/types';
import TokenSelect from '../TokenSelect/TokenSelect';
import styles from './SoloTokenSelect.module.css';
import SoloTokenImport from './SoloTokenImport';
import { CrocEnvContext } from '../../../contexts/CrocEnvContext';
import { ethers } from 'ethers';
import { TokenContext } from '../../../contexts/TokenContext';
import { linkGenMethodsIF, useLinkGen } from '../../../utils/hooks/useLinkGen';
import { CachedDataContext } from '../../../contexts/CachedDataContext';
import { IS_LOCAL_ENV, ZERO_ADDRESS } from '../../../ambient-utils/constants';
import {
    removeWrappedNative,
    isWethToken,
} from '../../../ambient-utils/dataLayer';
import { WarningBox } from '../../RangeActionModal/WarningBox/WarningBox';
import { IoIosArrowBack } from 'react-icons/io';
import { TradeDataContext } from '../../../contexts/TradeDataContext';

interface propsIF {
    showSoloSelectTokenButtons: boolean;
    setShowSoloSelectTokenButtons: Dispatch<SetStateAction<boolean>>;
    isSingleToken: boolean;
    tokenAorB: 'A' | 'B' | null;
    reverseTokens?: () => void;
    onClose: () => void;
}

export const SoloTokenSelect = (props: propsIF) => {
    const {
        onClose,
        setShowSoloSelectTokenButtons,
        showSoloSelectTokenButtons,
        isSingleToken,
        tokenAorB,
        reverseTokens,
    } = props;

    const { cachedTokenDetails } = useContext(CachedDataContext);
    const {
        chainData: { chainId },
        provider,
    } = useContext(CrocEnvContext);

    const {
        tokens,
        outputTokens,
        rawInput,
        validatedInput,
        setInput,
        searchType,
        addRecentToken,
        getRecentTokens,
    } = useContext(TokenContext);

    const { tokenA, tokenB, setSoloToken } = useContext(TradeDataContext);

    // hook to generate a navigation action for when modal is closed
    // no arg ➡ hook will infer destination from current URL path
    const linkGenAny: linkGenMethodsIF = useLinkGen();

    // fn to respond to a user clicking to select a token
    const chooseToken = (tkn: TokenIF, isCustom: boolean): void => {
        if (isCustom) {
            tokens.acknowledge(tkn);
        }

        if (isSingleToken) setSoloToken(tkn);

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
                if (reverseTokens) {
                    reverseTokens();
                }
                onClose();
                return;
            }
            goToNewUrlParams(
                chainId,
                tkn.address,
                tokenB.address.toLowerCase() === tkn.address.toLowerCase()
                    ? tokenA.address
                    : tokenB.address,
            );
            // user is updating token B
        } else if (tokenAorB === 'B') {
            if (tokenA.address.toLowerCase() === tkn.address.toLowerCase()) {
                if (reverseTokens) {
                    reverseTokens();
                }
                onClose();
                return;
            }
            goToNewUrlParams(
                chainId,
                tokenA.address.toLowerCase() === tkn.address.toLowerCase()
                    ? tokenB.address
                    : tokenA.address,
                tkn.address,
            );
        }

        function goToNewUrlParams(
            chain: string,
            addrTokenA: string,
            addrTokenB: string,
        ): void {
            linkGenAny.navigate({
                chain: chain,
                tokenA: addrTokenA,
                tokenB: addrTokenB,
            });
        }
        setInput('');
        // close the token modal
        onClose();
    };

    // hook to hold data for a token pulled from on-chain
    // null value is allowed to clear the hook when needed or on error
    const [customToken, setCustomToken] = useState<TokenIF | null | 'querying'>(
        null,
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
        cachedTokenDetails(
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
    }, [searchType, validatedInput, provider, cachedTokenDetails]);
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
                if (tokens.verify(validatedInput)) {
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

    const clearInputFieldAndCloseModal = () => {
        setInput('');
        onClose();
    };

    const deviceHasKeyboard = 'ontouchstart' in document.documentElement;

    useEffect(() => {
        if (deviceHasKeyboard) return;

        const input = document.getElementById(
            'token_select_input_field',
        ) as HTMLInputElement;
        if (input) input.focus();
    }, [deviceHasKeyboard]);

    // arbitrary limit on number of tokens to display in DOM for performance
    const MAX_TOKEN_COUNT = 300;

    const WETH_WARNING = ' Ambient uses Native Ether (ETH) to lower gas costs.';

    // const isInit = location.pathname.startsWith('/initpool');

    return (
        <section className={styles.container}>
            <header className={styles.header}>
                <IoIosArrowBack onClick={clearInputFieldAndCloseModal} />
                <p>Select Token</p>
                <p />
            </header>
            <div className={styles.input_control_container}>
                <input
                    id='token_select_input_field'
                    spellCheck='false'
                    type='text'
                    value={rawInput}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder=' Search name or paste address'
                    style={{
                        color: showSoloSelectTokenButtons
                            ? 'var(--text2)'
                            : 'var(--text3)',
                    }}
                />
                {validatedInput && (
                    <button
                        className={styles.clearButton}
                        onClick={() => setInput('')}
                        aria-label='Clear input'
                        tabIndex={0}
                    >
                        Clear
                    </button>
                )}
            </div>
            <div style={{ padding: '1rem' }}>
                {isWethToken(validatedInput) && (
                    <WarningBox
                        title=''
                        details={WETH_WARNING}
                        noBackground
                        button={
                            <button
                                onClick={() => {
                                    try {
                                        const wethToken =
                                            tokens.getTokenByAddress(
                                                validatedInput,
                                            );
                                        if (wethToken) {
                                            chooseToken(wethToken, false);
                                        }
                                    } catch (err) {
                                        IS_LOCAL_ENV && console.warn(err);
                                        onClose();
                                    }
                                }}
                            >
                                I understand, use WETH
                            </button>
                        }
                    />
                )}
            </div>
            {isWethToken(validatedInput) &&
                [tokens.getTokenByAddress(ZERO_ADDRESS) as TokenIF].map(
                    (token: TokenIF) => (
                        <TokenSelect
                            key={JSON.stringify(token)}
                            token={token}
                            chooseToken={chooseToken}
                            fromListsText=''
                        />
                    ),
                )}
            {showSoloSelectTokenButtons ? (
                <div className={styles.scrollable_container}>
                    {removeWrappedNative(chainId, outputTokens)
                        .slice(0, MAX_TOKEN_COUNT)
                        .map((token: TokenIF) => (
                            <TokenSelect
                                key={JSON.stringify(token)}
                                token={token}
                                chooseToken={chooseToken}
                                fromListsText=''
                            />
                        ))}
                </div>
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
