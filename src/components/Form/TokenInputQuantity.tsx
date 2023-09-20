import {
    useContext,
    useState,
    useEffect,
    ChangeEvent,
    memo,
    useRef,
    Dispatch,
    SetStateAction,
} from 'react';
import { RiArrowDownSLine } from 'react-icons/ri';

import { exponentialNumRegEx } from '../../utils/regex/exports';

import uriToHttp from '../../utils/functions/uriToHttp';
import { TokenIF } from '../../utils/interfaces/TokenIF';
import Spinner from '../Global/Spinner/Spinner';
import { DefaultTooltip } from '../Global/StyledTooltip/StyledTooltip';
import TokenIcon from '../Global/TokenIcon/TokenIcon';
import { SoloTokenSelectModal } from '../Global/TokenSelectContainer/SoloTokenSelectModal';
import { linkGenMethodsIF, useLinkGen } from '../../utils/hooks/useLinkGen';
import { Link, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../utils/hooks/reduxToolkit';
import { CrocEnvContext } from '../../contexts/CrocEnvContext';
import { useSimulatedIsPoolInitialized } from '../../App/hooks/useSimulatedIsPoolInitialized';
import { useModal } from '../Global/Modal/useModal';
import { FlexContainer, Text } from '../../styled/Common';
import {
    InputDisabledText,
    TokenQuantityContainer,
    TokenQuantityInput,
    TokenSelectButton,
} from '../../styled/Components/TradeModules';
import {
    setLocalTokenA,
    setLocalTokenB,
} from '../../utils/state/localPairDataSlice';

interface propsIF {
    tokenAorB: 'A' | 'B' | null;
    token: TokenIF;
    value: string;
    handleTokenInputEvent: (val: string) => void;
    reverseTokens?: () => void;
    parseInput?: (val: string) => void;
    fieldId?: string;
    isLoading?: boolean;
    label?: string;
    includeWallet?: React.ReactNode;
    showPulseAnimation?: boolean;
    disable?: boolean;
    disabledContent?: React.ReactNode;
    setTokenModalOpen?: Dispatch<SetStateAction<boolean>>;
    onInitPage?: boolean;
}

function TokenInputQuantity(props: propsIF) {
    const {
        fieldId,
        tokenAorB,
        token,
        value,
        isLoading,
        label,
        includeWallet,
        showPulseAnimation,
        disable,
        disabledContent,
        handleTokenInputEvent,
        reverseTokens,
        parseInput,
        setTokenModalOpen = () => null,
    } = props;
    const isPoolInitialized = useSimulatedIsPoolInitialized();
    const dispatch = useAppDispatch();
    const location = useLocation();

    const { tradeData } = useAppSelector((state) => state);
    const {
        chainData: { chainId },
    } = useContext(CrocEnvContext);

    const linkGenInitPool: linkGenMethodsIF = useLinkGen('initpool');

    const [isTokenSelectOpen, openTokenSelect, closeTokenSelect] = useModal();

    const onInitPage = location.pathname.startsWith('/initpool');

    // needed to not dismiss exchangebalance modal when closing the token select modal
    useEffect(() => {
        setTokenModalOpen(isTokenSelectOpen);
    }, [isTokenSelectOpen]);

    const [showSoloSelectTokenButtons, setShowSoloSelectTokenButtons] =
        useState(true);

    const [displayValue, setDisplayValue] = useState<string>('');
    // trigger useEffect to update display value if the parsed value is the same as existing (12 -> 0000012 -> 12)
    const [inputChanged, setInputChanged] = useState(false);

    useEffect(() => {
        setDisplayValue(value);
    }, [inputChanged, value]);

    const onBlur = (input: string) => {
        setInputChanged(!inputChanged);
        parseInput && parseInput(input);
    };

    const precisionOfInput = (inputString: string) => {
        if (inputString.includes('.')) {
            return inputString.split('.')[1].length;
        }
        return 0;
    };

    const onChange = (event: ChangeEvent<HTMLInputElement>) => {
        const isPrecisionGreaterThanDecimals =
            precisionOfInput(event.target.value) > token.decimals;

        if (
            !isPrecisionGreaterThanDecimals &&
            (event.target.value === '' ||
                exponentialNumRegEx.test(event.target.value))
        ) {
            handleTokenInputEvent(value);
            setDisplayValue(value);
        }
    };

    const tokenSymbol =
        token?.symbol?.length > 4 ? (
            <DefaultTooltip
                title={token.symbol}
                placement={'top'}
                arrow
                enterDelay={700}
                leaveDelay={200}
            >
                <Text fontSize='header2' color='text1'>
                    {token.symbol}
                </Text>
            </DefaultTooltip>
        ) : (
            <Text fontSize='header2' color='text1'>
                {token.symbol}
            </Text>
        );

    const tokenSelectRef = useRef(null);
    function handleNavigationToInit() {
        dispatch(setLocalTokenA(tradeData.tokenA));
        dispatch(setLocalTokenB(tradeData.tokenB));
    }

    const poolNotInitializedContent = tokenSelectRef.current && (
        <InputDisabledText
            flexDirection='column'
            alignItems='center'
            justifyContent='center'
            fullHeight
            fullWidth
        >
            This pool has not been initialized.
            <Text color='accent1'>
                <Link
                    to={linkGenInitPool.getFullURL({
                        chain: chainId,
                        tokenA: tradeData.tokenA.address,
                        tokenB: tradeData.tokenB.address,
                    })}
                    onClick={handleNavigationToInit}
                >
                    Initialize it to continue.
                </Link>
            </Text>
        </InputDisabledText>
    );

    const input = (
        <TokenQuantityInput
            id={fieldId ? `${fieldId}_qty` : undefined}
            placeholder={isLoading ? '' : '0.0'}
            onChange={(event: ChangeEvent<HTMLInputElement>) => onChange(event)}
            onBlur={(event: ChangeEvent<HTMLInputElement>) =>
                onBlur(event.target.value)
            }
            value={isLoading ? '' : displayValue}
            type='string'
            step='any'
            inputMode='decimal'
            autoComplete='off'
            autoCorrect='off'
            min='0'
            minLength={1}
            disabled={disable}
        />
    );
    const inputContent = (() => {
        switch (true) {
            case !isPoolInitialized &&
                fieldId !== 'exchangeBalance' &&
                !onInitPage:
                return poolNotInitializedContent;
            case disabledContent !== undefined:
                return disabledContent;
            case isPoolInitialized:
                return input;
            default:
                return input;
        }
    })();
    return (
        <FlexContainer flexDirection='column' color='text1' id={fieldId}>
            {label && (
                <Text margin='4px 0' fontSize='body' color='text1'>
                    {label}
                </Text>
            )}
            <TokenQuantityContainer
                animation={showPulseAnimation ? 'pulse' : ''}
                style={{ marginBottom: !includeWallet ? '8px' : '0' }}
            >
                <div style={{ position: 'relative' }}>
                    {isLoading ? (
                        <FlexContainer
                            fullWidth
                            fullHeight
                            alignItems='center'
                            margin='0 32px'
                        >
                            <Spinner size={24} bg='var(--dark2)' weight={2} />
                        </FlexContainer>
                    ) : (
                        inputContent
                    )}
                </div>
                <TokenSelectButton
                    id={fieldId ? `${fieldId}_token_selector` : undefined}
                    onClick={openTokenSelect}
                    tabIndex={0}
                    aria-label='Open swap sell token modal.'
                    ref={tokenSelectRef}
                >
                    <TokenIcon
                        token={token}
                        src={uriToHttp(token.logoURI)}
                        alt={token.symbol}
                        size='2xl'
                    />
                    {tokenSymbol}
                    <RiArrowDownSLine size={27} />
                </TokenSelectButton>
            </TokenQuantityContainer>

            {includeWallet && includeWallet}
            {isTokenSelectOpen && (
                <SoloTokenSelectModal
                    onClose={closeTokenSelect}
                    showSoloSelectTokenButtons={showSoloSelectTokenButtons}
                    setShowSoloSelectTokenButtons={
                        setShowSoloSelectTokenButtons
                    }
                    isSingleToken={!tokenAorB}
                    tokenAorB={tokenAorB}
                    reverseTokens={reverseTokens}
                />
            )}
        </FlexContainer>
    );
}

export default memo(TokenInputQuantity);
