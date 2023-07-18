import styles from './TokenInputQuantity.module.css';
import { RiArrowDownSLine } from 'react-icons/ri';
import { useState, ChangeEvent, useContext, memo, useEffect } from 'react';
import { useModal } from '../Modal/useModal';
import Modal from '../Modal/Modal';
import { SoloTokenSelect } from '../TokenSelectContainer/SoloTokenSelect';
import { DefaultTooltip } from '../StyledTooltip/StyledTooltip';
import { TokenContext } from '../../../contexts/TokenContext';
import TokenIcon from '../TokenIcon/TokenIcon';
import uriToHttp from '../../../utils/functions/uriToHttp';
import Spinner from '../Spinner/Spinner';
import { TokenIF } from '../../../utils/interfaces/TokenIF';

interface propsIF {
    fieldId?: string;
    tokenAorB: 'A' | 'B' | null;
    value: string;
    handleTokenInputEvent: (val: string) => void;
    reverseTokens?: () => void;
    isLoading?: boolean;
    label?: string;
    includeWallet?: React.ReactNode;
    parseInput?: (val: string) => void;
    showPulseAnimation?: boolean;
    disable?: boolean;
    isAdvancedMode?: boolean;
    disabledContent?: React.ReactNode;
    token: TokenIF;
}

function TokenInputQuantity(props: propsIF) {
    const {
        fieldId,
        value,
        tokenAorB,
        handleTokenInputEvent,
        reverseTokens,
        isLoading,
        label,
        includeWallet,
        parseInput,
        showPulseAnimation,
        disable,
        disabledContent,
        isAdvancedMode,
        token,
    } = props;

    const { setInput: setTokenSelectInput } = useContext(TokenContext);

    const modalCloseCustom = (): void => setTokenSelectInput('');

    const [isTokenModalOpen, openTokenModal, closeTokenModal] =
        useModal(modalCloseCustom);
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

    return (
        <div className={styles.swapbox} id={fieldId}>
            {label && <span className={styles.direction}>{label}</span>}
            <div
                className={`${styles.swapbox_top} ${
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
                            <>
                                {isAdvancedMode && disable && disabledContent}

                                <input
                                    id={fieldId ? `${fieldId}_qty` : undefined}
                                    className={styles.input}
                                    placeholder={isLoading ? '' : '0.0'}
                                    onChange={(event) => onChange(event)}
                                    onBlur={(event) =>
                                        onBlur(event.target.value)
                                    }
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
                            </>
                        )}
                    </div>
                </div>
                <button
                    id={fieldId ? `${fieldId}_token_selector` : undefined}
                    className={styles.token_select}
                    onClick={openTokenModal}
                    tabIndex={0}
                    aria-label='Open swap sell token modal.'
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

            {isTokenModalOpen && (
                <Modal
                    onClose={closeTokenModal}
                    title='Select Token'
                    centeredTitle
                    handleBack={() => setTokenSelectInput('')}
                    showBackButton={false}
                    footer={null}
                >
                    <SoloTokenSelect
                        modalCloseCustom={modalCloseCustom}
                        closeModal={closeTokenModal}
                        showSoloSelectTokenButtons={showSoloSelectTokenButtons}
                        setShowSoloSelectTokenButtons={
                            setShowSoloSelectTokenButtons
                        }
                        isSingleToken={!tokenAorB}
                        tokenAorB={tokenAorB}
                        reverseTokens={reverseTokens}
                    />
                </Modal>
            )}
        </div>
    );
}

export default memo(TokenInputQuantity);
