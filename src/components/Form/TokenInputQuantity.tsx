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

import { uriToHttp } from '../../ambient-utils/dataLayer';
import { TokenIF } from '../../ambient-utils/types';
import Spinner from '../Global/Spinner/Spinner';
import { DefaultTooltip } from '../Global/StyledTooltip/StyledTooltip';
import TokenIcon from '../Global/TokenIcon/TokenIcon';
import { SoloTokenSelectModal } from '../Global/TokenSelectContainer/SoloTokenSelectModal';
import { linkGenMethodsIF, useLinkGen } from '../../utils/hooks/useLinkGen';
import { Link, useLocation } from 'react-router-dom';
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
import { SoloTokenSelect } from '../Global/TokenSelectContainer/SoloTokenSelect';
import { TradeDataContext } from '../../contexts/TradeDataContext';

interface propsIF {
    tokenAorB: 'A' | 'B' | null;
    token: TokenIF;
    value: string;
    handleTokenInputEvent: (val: string) => void;
    reverseTokens?: () => void;
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
        setTokenModalOpen = () => null,
    } = props;
    const isPoolInitialized = useSimulatedIsPoolInitialized();
    const location = useLocation();

    const { tokenA, tokenB } = useContext(TradeDataContext);
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
    useEffect(() => {
        if (isLoading) {
            setDisplayValue('');
        } else {
            setDisplayValue(value);
        }
    }, [value, isLoading]);

    const precisionOfInput = (inputString: string) => {
        if (inputString.includes('.')) {
            return inputString.split('.')[1].length;
        }
        return 0;
    };

    const onChange = (event: ChangeEvent<HTMLInputElement>) => {
        let inputStringNoCommas = event.target.value.replace(/,/g, '.');
        const isPrecisionGreaterThanDecimals =
            precisionOfInput(inputStringNoCommas) > token.decimals;
        if (inputStringNoCommas === '.') inputStringNoCommas = '0.';
        if (!isPrecisionGreaterThanDecimals && !isNaN(+inputStringNoCommas)) {
            handleTokenInputEvent(inputStringNoCommas);
            setDisplayValue(inputStringNoCommas);
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
                <>{token.symbol}</>
            </DefaultTooltip>
        ) : (
            <>{token.symbol}</>
        );

    const tokenSelectRef = useRef(null);

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
                        tokenA: tokenA.address,
                        tokenB: tokenB.address,
                    })}
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
            value={displayValue}
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

    const isInit = location.pathname.startsWith('/initpool');

    const modalOrNoModal = isInit ? (
        <SoloTokenSelect
            onClose={closeTokenSelect}
            showSoloSelectTokenButtons={showSoloSelectTokenButtons}
            setShowSoloSelectTokenButtons={setShowSoloSelectTokenButtons}
            isSingleToken={!tokenAorB}
            tokenAorB={tokenAorB}
            reverseTokens={reverseTokens}
        />
    ) : (
        <SoloTokenSelectModal
            onClose={closeTokenSelect}
            showSoloSelectTokenButtons={showSoloSelectTokenButtons}
            setShowSoloSelectTokenButtons={setShowSoloSelectTokenButtons}
            isSingleToken={!tokenAorB}
            tokenAorB={tokenAorB}
            reverseTokens={reverseTokens}
        />
    );

    return (
        <FlexContainer
            flexDirection='column'
            id={fieldId}
            style={{
                background: 'var(--dark2)',
                borderRadius: '1rem',
                gap: '8px',
                padding: '8px 8px 8px 16px ',
                minHeight: '81px',
            }}
        >
            {label && (
                <Text margin='4px 0' fontSize='body' color='text1'>
                    {label}
                </Text>
            )}
            <TokenQuantityContainer
                animation={showPulseAnimation ? 'pulse' : ''}
                style={{ marginBottom: !includeWallet ? '8px' : '0' }}
            >
                {isLoading ? (
                    <FlexContainer fullWidth fullHeight alignItems='center'>
                        <Spinner size={24} bg='var(--dark2)' weight={2} />
                    </FlexContainer>
                ) : !isPoolInitialized &&
                  fieldId !== 'exchangeBalance' &&
                  !onInitPage ? (
                    poolNotInitializedContent
                ) : disabledContent !== undefined ? (
                    disabledContent
                ) : (
                    input
                )}

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
            {isTokenSelectOpen && modalOrNoModal}
        </FlexContainer>
    );
}

export default memo(TokenInputQuantity);
