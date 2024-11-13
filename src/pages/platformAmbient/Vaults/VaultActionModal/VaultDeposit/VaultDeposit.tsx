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

interface Props {
    token0: TokenIF;
    token1: TokenIF;
    onClose: () => void;

}
export default function VaultDeposit(props: Props) {
    const [showConfirmation, setShowConfirmation] = useState(false)
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
            placeholder={showConfirmation ? displayValue :  '0.0'}
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

            <div className={styles.buttonContainer}>


            <Button
                idForDOM='vault_deposit_submit'
                style={{ textTransform: 'none' }}
                title={'Submit'}
                disabled={false}
                action={() => setShowConfirmation(true)}
                flat
                />
                </div>
            </div>
            </Modal>
    );
}
