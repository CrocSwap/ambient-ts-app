import styles from './VaultRow.module.css';
import tempestLogoColor from './tempestLogoColor.svg';
// import tempestLogo from './tempestLogo.svg';
import { FlexContainer } from '../../../../styled/Common';
import {
    getFormattedNumber,
    uriToHttp,
} from '../../../../ambient-utils/dataLayer';
import TokenIcon from '../../../../components/Global/TokenIcon/TokenIcon';
import useMediaQuery from '../../../../utils/hooks/useMediaQuery';
import { useModal } from '../../../../components/Global/Modal/useModal';
import { VaultIF } from '../../../../ambient-utils/types';
import { useContext, useEffect, useState } from 'react';
import {
    AppStateContext,
    UserDataContext,
    TokenContext,
    CrocEnvContext,
    ReceiptContext,
} from '../../../../contexts';
import { formatDollarAmount } from '../../../../utils/numbers';
import VaultDeposit from '../VaultActionModal/VaultDeposit/VaultDeposit';
import VaultWithdraw from '../VaultActionModal/VaultWithdraw/VaultWithdraw';
import { RiExternalLinkLine } from 'react-icons/ri';
import { toDisplayQty } from '@crocswap-libs/sdk';
import TooltipComponent from '../../../../components/Global/TooltipComponent/TooltipComponent';
import { DefaultTooltip } from '../../../../components/Global/StyledTooltip/StyledTooltip';
import IconWithTooltip from '../../../../components/Global/IconWithTooltip/IconWithTooltip';

interface propsIF {
    idForDOM: string;
    vault: VaultIF;
}
export default function VaultRow(props: propsIF) {
    const { idForDOM, vault } = props;
    const [isOpen, openModal, closeModal] = useModal();
    const [type, setType] = useState<'Deposit' | 'Withdraw'>('Deposit');

    const { tokens } = useContext(TokenContext);
    const { crocEnv } = useContext(CrocEnvContext);
    const { isUserConnected, userAddress } = useContext(UserDataContext);
    const { sessionReceipts } = useContext(ReceiptContext);

    const {
        activeNetwork: { chainId },
    } = useContext(AppStateContext);

    const mainAsset = tokens.getTokenByAddress(vault.mainAsset);
    const secondaryAssetAddress =
        vault.token0Address.toLowerCase() === vault.mainAsset.toLowerCase()
            ? vault.token1Address
            : vault.token0Address;
    const secondaryAsset = tokens.getTokenByAddress(secondaryAssetAddress);

    const showMobileVersion = useMediaQuery('(max-width: 768px)');

    const [balanceMainAsset, setBalanceMainAsset] = useState<
        bigint | undefined
    >();

    // useEffect to check if user has approved Tempest to sell token 1
    useEffect(() => {
        if (crocEnv && vault) {
            setBalanceMainAsset(undefined);
            if (userAddress) {
                (async () => {
                    try {
                        const tempestVault = crocEnv.tempestVault(
                            vault.address,
                            vault.mainAsset,
                        );

                        // const balanceMainAssetResponse =
                        //     await tempestVault.balanceToken1(
                        //         '0xE09de95d2A8A73aA4bFa6f118Cd1dcb3c64910Dc',
                        //     );

                        const balanceMainAssetResponse =
                            await tempestVault.balanceToken1(userAddress);

                        setBalanceMainAsset(balanceMainAssetResponse);
                    } catch (err) {
                        console.warn(err);
                    }
                })();
            }
        }
    }, [crocEnv, vault, userAddress, sessionReceipts.length]);

    if (
        Number(chainId) !== Number(vault.chainId) ||
        !mainAsset ||
        !secondaryAsset
    ) {
        return null;
    }

    const tokenIconsDisplay = (
        <FlexContainer alignItems='center' gap={5} style={{ flexShrink: 0 }}>
            <div className={styles.tempestDisplay}>
                <DefaultTooltip title={'Tempest Finance'}>
                    <img src={tempestLogoColor} alt='tempest' />
                </DefaultTooltip>
            </div>
            <IconWithTooltip title={mainAsset.symbol} placement='bottom'>
                <TokenIcon
                    token={mainAsset}
                    src={uriToHttp(mainAsset.logoURI)}
                    alt={mainAsset.symbol}
                    size={showMobileVersion ? 'm' : '2xl'}
                />
            </IconWithTooltip>
            <IconWithTooltip title={secondaryAsset.symbol} placement='bottom'>
                <TokenIcon
                    token={secondaryAsset}
                    src={uriToHttp(secondaryAsset.logoURI)}
                    alt={secondaryAsset.symbol}
                    size={showMobileVersion ? 'm' : '2xl'}
                />{' '}
            </IconWithTooltip>
        </FlexContainer>
    );

    const mainAssetBalanceDisplayQty = balanceMainAsset
        ? getFormattedNumber({
              value: parseFloat(
                  toDisplayQty(balanceMainAsset, mainAsset.decimals),
              ),
          })
        : '...';

    const depositsDisplay = (
        <FlexContainer
            alignItems='flex-end'
            flexDirection='column'
            justifyContent='flex-end'
            gap={5}
            style={{ flexShrink: 0 }}
            className={styles.depositContainer}
        >
            <FlexContainer flexDirection='row' alignItems='center' gap={4}>
                {mainAssetBalanceDisplayQty}
                {!!balanceMainAsset && (
                    <>
                        <TokenIcon
                            token={mainAsset}
                            src={uriToHttp(mainAsset.logoURI)}
                            alt={mainAsset.symbol}
                            size={'m'}
                        />
                        <TooltipComponent
                            placement='top'
                            title='Vault positions can hold both tokens in a pair. Displayed position values represent estimated redeemable token positions for the primary token on withdrawal.'
                        />
                    </>
                )}
            </FlexContainer>
        </FlexContainer>
    );

    const formattedAPR = getFormattedNumber({
        value: parseFloat(vault.apr) * 100,
        prefix: '',
        suffix: '%',
        minFracDigits: 2,
        maxFracDigits: 2,
    });

    function handleOpenWithdrawModal() {
        setType('Withdraw');
        openModal();
    }
    function handleOpenDepositModal() {
        setType('Deposit');
        openModal();
    }

    const modalToOpen =
        type === 'Deposit' ? (
            <VaultDeposit
                mainAsset={mainAsset}
                secondaryAsset={secondaryAsset}
                vault={vault}
                onClose={closeModal}
            />
        ) : (
            <VaultWithdraw
                mainAsset={mainAsset}
                vault={vault}
                balanceMainAsset={balanceMainAsset}
                mainAssetBalanceDisplayQty={mainAssetBalanceDisplayQty}
                onClose={closeModal}
            />
        );
    function navigateExternal(): void {
        const goToExternal = (url: string) => window.open(url, '_blank');
        if (Number(vault.chainId) === 534352) {
            const destination: string =
                'https://app.tempestfinance.xyz/vaults/scroll/' + vault.address;
            goToExternal(destination);
        } else if (Number(vault.chainId) === 1) {
            const destination: string =
                'https://app.tempestfinance.xyz/vaults/ethereum/' +
                vault.address;
            goToExternal(destination);
        }
    }

    return (
        <>
            <div id={idForDOM} className={styles.mainContainer}>
                <div className={styles.contentColumn}>
                    <div className={styles.mainContent}>
                        {tokenIconsDisplay}
                        <p
                            className={styles.poolName}
                            onClick={() => navigateExternal()}
                        >
                            <span>
                                {mainAsset.symbol} / {secondaryAsset.symbol}
                            </span>
                            <RiExternalLinkLine size={20} />
                        </p>
                        <p className={styles.tvlDisplay}>
                            {formatDollarAmount(parseFloat(vault.tvlUsd))}
                        </p>
                        {depositsDisplay}
                        <p
                            className={styles.apyDisplay}
                            style={{ color: 'var(--other-green' }}
                        >
                            {formattedAPR}
                            <TooltipComponent
                                placement='top-end'
                                title='APR estimates provided by vault provider.'
                            />
                        </p>
                        <div className={styles.actionButtonContainer}>
                            <button
                                className={`${styles.actionButton} ${!isUserConnected ? styles.disabledButton : ''}`}
                                onClick={handleOpenDepositModal}
                            >
                                Deposit
                            </button>

                            {isUserConnected && !!balanceMainAsset && (
                                <button
                                    className={styles.actionButton}
                                    onClick={handleOpenWithdrawModal}
                                >
                                    Withdraw
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            {isOpen && modalToOpen}
        </>
    );
}
