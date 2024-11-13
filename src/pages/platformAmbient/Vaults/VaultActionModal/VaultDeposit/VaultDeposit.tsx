import { ChangeEvent, useContext, useRef, useState } from 'react';
import { TokenIF } from '../../../../../ambient-utils/types';
import { UserDataContext } from '../../../../../contexts';
import styles from './VaultDeposit.module.css';
import WalletBalanceSubinfo from '../../../../../components/Form/WalletBalanceSubinfo';
import {
    precisionOfInput,
    uriToHttp,
} from '../../../../../ambient-utils/dataLayer';
import TokenIcon from '../../../../../components/Global/TokenIcon/TokenIcon';
import { DefaultTooltip } from '../../../../../components/Global/StyledTooltip/StyledTooltip';
import Button from '../../../../../components/Form/Button';
import Modal from '../../../../../components/Global/Modal/Modal';
import ModalHeader from '../../../../../components/Global/ModalHeader/ModalHeader';
import { ExtraInfo } from '../../../../../components/Trade/TradeModules/ExtraInfo/ExtraInfo';

interface Props {
    token0: TokenIF;
    token1: TokenIF;
    onClose: () => void;
}
export default function VaultDeposit(props: Props) {
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [ showSubmitted, setShowSubmitted] = useState(false)
    // eslint-disable-next-line
    const { token0, token1, onClose } = props;
    // const {
    //     tokenABalance,
    //     tokenBBalance,
    //     tokenADexBalance,
    //     tokenBDexBalance,
    //     isTokenAEth: isSellTokenEth,
    //     isTokenBEth: isBuyTokenEth,
    //     contextMatchesParams,
    // } = useContext(TradeTokenContext);

    const { isUserConnected } = useContext(UserDataContext);

    const walletContent = (
        <>
            <WalletBalanceSubinfo
                usdValueForDom={
                    '1234'
                    // isLoading ||
                    // impactCalculationPending ||
                    // !usdValueForDom ||
                    // disabledContent ||
                    // !isPoolInitialized
                    //     ? ''
                    //     : usdValueForDom
                }
                percentDiffUsdValue={123}
                showWallet={isUserConnected}
                isWithdraw={false}
                balance={'1234'}
                availableBalance={0n}
                useExchangeBalance={
                    // isDexSelected &&
                    // !!tokenDexBalance &&
                    // parseFloat(tokenDexBalance) > 0
                    false
                }
                isDexSelected={false}
                onToggleDex={() => console.log('handleToggleDex')}
                onMaxButtonClick={() => console.log('on max button click')}
            />
        </>
    );
    const [displayValue, setDisplayValue] = useState<string>('');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleTokenInputEvent = (evt: any) => console.log(evt);
    const token = token0;

    const fieldId = 'vault_deposit_input';
    const onChange = (event: ChangeEvent<HTMLInputElement>) => {
        let inputStringNoCommas = event.target.value
            .replace(/,/g, '.') // Replace commas with dots
            .replace(/\s+/g, ''); // Remove any spaces

        if (inputStringNoCommas === '.') inputStringNoCommas = '0.';

        const inputStringNoUnfinishedExponent = isNaN(+inputStringNoCommas)
            ? inputStringNoCommas.replace(
                  /e[+-]?(?!\d)/gi, // Match 'e', 'e-' or 'e+' only if NOT followed by a number
                  '',
              )
            : inputStringNoCommas;

        const isPrecisionGreaterThanDecimals =
            precisionOfInput(inputStringNoCommas) > token.decimals;

        if (
            !isPrecisionGreaterThanDecimals &&
            !isNaN(+inputStringNoUnfinishedExponent)
        ) {
            handleTokenInputEvent(inputStringNoCommas);
            setDisplayValue(inputStringNoCommas);
        }
    };

    const input = (
        <input
            className={styles.tokenQuantityInput}
            id={fieldId ? `${fieldId}_qty` : undefined}
            placeholder={showConfirmation ? displayValue : '0.0'}
            onChange={(event: ChangeEvent<HTMLInputElement>) => onChange(event)}
            value={displayValue}
            type='string'
            step='any'
            inputMode='decimal'
            autoComplete='off'
            autoCorrect='off'
            min='0'
            minLength={1}
            disabled={showConfirmation}
        />
    );

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

    const tokenSelectButton = (
        <button
            className={`${styles.tokenSelectButton} ${styles.justDisplay}
            }`}
            id={fieldId ? `${fieldId}_token_selector` : undefined}
            onClick={undefined}
            tabIndex={0}
            aria-label='Open swap sell token modal.'
            ref={tokenSelectRef}
            style={{
                borderRadius: '50px',
            }}
        >
            <TokenIcon
                token={token}
                src={uriToHttp(token.logoURI)}
                alt={token.symbol}
                size='2xl'
            />
            {tokenSymbol}
        </button>
    );

    const extraInfo = [
        {
            title: 'Expected Output',
            tooltipTitle:
                'Expected Conversion Rate After Price Impact and Provider Fee',
            data: '...',
            placement: 'bottom',
        },
        {
            title: 'Price Impact',
            tooltipTitle: 'Expected Pool Price After Swap',
            data: '...',
            placement: 'bottom',
        },
        {
            title: 'Slippage Tolerance',
            tooltipTitle: 'Expected Pool Price After Swap',
            data: '...',
            placement: 'bottom',
        },
        {
            title: 'Liquidity Provider Fee',
            tooltipTitle: 'Expected Pool Price After Swap',
            data: '...',
            placement: 'bottom',
        },
    ];

    const confirmationDetails = (
        <div className={styles.confContainer}>

        <div className={styles.confDetails}>
            <div className={styles.confRow}>
                <p>Current Price</p>
                <p>1,690</p>
            </div>
            <div className={styles.confRow}>
                <p>Price Limit</p>
                <p>1,690</p>
            </div>
            <div className={styles.confRow}>
                <p>Slippage</p>
                <p>0.3%</p>
            </div>
            </div>
            
            <p>Output is estimated. You will swap up to 1.00ETH for USDC. You may swap less than 1.00ETH if the price moves beyond the limit shown above. You can increase the likelihood of swapping the full amound by increasing your slippage tolerance in the settings.</p>
        </div>
    );
    const submittedButtonTitle = (
        <div className={styles.loading}>
            Submitting
            <span className={styles.dots}></span>

        </div>
    )

    const includeWallet = true;
    return (
        <Modal usingCustomHeader onClose={onClose}>
            <ModalHeader
                onClose={onClose}
                title={'Deposit'}
                onBackButton={() => setShowConfirmation(false)}
                showBackButton={showConfirmation}
            />
            <div className={styles.container}>
            <p className={styles.disclaimer}>{`This deposit function uses "Zap Mode" to convert ${props.token1.symbol} deposit into vault position which hold both ${props.token1.symbol} and ${props.token0.symbol}. The value of a vault deposit will fluctuate with the value of both these tokens and their exchange rate.`}</p>
                <div className={styles.content}>
                    <div
                        className={styles.tokenQuantityContainer}
                        style={{ marginBottom: !includeWallet ? '8px' : '0' }}
                    >
                        {input}
                        {tokenSelectButton}
                    </div>
                    {includeWallet && !showConfirmation && walletContent}
                </div>

            { showConfirmation ? confirmationDetails :   <ExtraInfo
                    extraInfo={extraInfo}
                    conversionRate={'conversionRate'}
                    gasPrice={'1234'}
                    showDropdown={true}
                    showWarning={false}
                    priceImpactExceedsThreshold={false}
                />}
                <div className={styles.buttonContainer}>
                    <Button
                        idForDOM='vault_deposit_submit'
                        style={{ textTransform: 'none' }}
                        title={showSubmitted ? submittedButtonTitle : 'Submit'}
                        disabled={showSubmitted}
                        action={() => {
                            if (!showConfirmation) {
                                setShowConfirmation(true);
                            } else {
                                setShowSubmitted(true);
                            }
                        }}
                        
                        flat
                    />
                </div>
            </div>
        </Modal>
    );
}
