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
import uriToHttp from '../../../utils/functions/uriToHttp';
import { TokenIF } from '../../../utils/interfaces/TokenIF';
import Spinner from '../Spinner/Spinner';
import { DefaultTooltip } from '../StyledTooltip/StyledTooltip';
import TokenIcon from '../TokenIcon/TokenIcon';
import { SoloTokenSelectModal } from '../TokenSelectContainer/SoloTokenSelectModal';
import styles from './TokenInputQuantity.module.css';
import { linkGenMethodsIF, useLinkGen } from '../../../utils/hooks/useLinkGen';
import { Link } from 'react-router-dom';
import { useAppSelector } from '../../../utils/hooks/reduxToolkit';
import { CrocEnvContext } from '../../../contexts/CrocEnvContext';
import { useSimulatedIsPoolInitialized } from '../../../App/hooks/useSimulatedIsPoolInitialized';
import { useModal } from '../Modal/useModal';

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
    const { tradeData } = useAppSelector((state) => state);
    const {
        chainData: { chainId },
    } = useContext(CrocEnvContext);

    const linkGenInitPool: linkGenMethodsIF = useLinkGen('initpool');

    const [isTokenSelectOpen, openTokenSelect, closeTokenSelect] = useModal();

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
        if (!isPrecisionGreaterThanDecimals && !isNaN(+event.target.value)) {
            handleTokenInputEvent(event.target.value);
            setDisplayValue(event.target.value);
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
                <div className={styles.token_list_text}>{token.symbol}</div>
            </DefaultTooltip>
        ) : (
            <div className={styles.token_list_text}>{token.symbol}</div>
        );

    const tokenSelectRef = useRef(null);

    const poolNotInitializedContent = tokenSelectRef.current && (
        <div className={styles.disabled_text}>
            This pool has not been initialized.
            <div className={styles.warning_text}>
                <Link
                    to={linkGenInitPool.getFullURL({
                        chain: chainId,
                        tokenA: tradeData.tokenA.address,
                        tokenB: tradeData.tokenB.address,
                    })}
                    className={styles.warning_text}
                >
                    Initialize it to continue.
                </Link>
            </div>
        </div>
    );

    const input = (
        <input
            id={fieldId ? `${fieldId}_qty` : undefined}
            className={styles.input}
            placeholder={isLoading ? '' : '0.0'}
            onChange={(event) => onChange(event)}
            onBlur={(event) => onBlur(event.target.value)}
            value={isLoading ? '' : displayValue}
            type='number'
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
            case !isPoolInitialized:
                return poolNotInitializedContent;
            case disabledContent:
                return disabledContent;
            case isPoolInitialized:
                return input;
            default:
                return input;
        }
    })();
    return (
        <div className={styles.container} id={fieldId}>
            {label && <span className={styles.label}>{label}</span>}
            <div
                className={`${styles.input_container} ${
                    showPulseAnimation && styles.pulse_animation
                } ${!includeWallet && styles.bottom_padding}`}
            >
                <div>
                    <div className={styles.token_quantity_input}>
                        {isLoading ? (
                            <div className={styles.circular_progress}>
                                <Spinner
                                    size={24}
                                    bg='var(--dark2)'
                                    weight={2}
                                />
                            </div>
                        ) : (
                            inputContent
                        )}
                    </div>
                </div>
                <button
                    id={fieldId ? `${fieldId}_token_selector` : undefined}
                    className={styles.token_select}
                    onClick={openTokenSelect}
                    tabIndex={0}
                    aria-label='Open swap sell token modal.'
                    ref={tokenSelectRef}
                >
                    <TokenIcon
                        src={uriToHttp(token.logoURI)}
                        alt={token.symbol}
                        size='2xl'
                    />
                    {tokenSymbol}
                    <RiArrowDownSLine size={27} />
                </button>
            </div>

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
        </div>
    );
}

export default memo(TokenInputQuantity);
