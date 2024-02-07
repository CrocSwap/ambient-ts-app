import Deposit from './Deposit/Deposit';
import Withdraw from './Withdraw/Withdraw';
import Transfer from './Transfer/Transfer';
import closeSidebarImage from '../../../assets/images/sidebarImages/closeSidebar.svg';

import transferImage from '../../../assets/images/sidebarImages/transfer.svg';
import withdrawImage from '../../../assets/images/sidebarImages/withdraw.svg';
import depositImage from '../../../assets/images/sidebarImages/deposit.svg';
import TabComponent from '../../Global/TabComponent/TabComponent';
import {
    SetStateAction,
    Dispatch,
    useState,
    useEffect,
    useContext,
} from 'react';
import { BigNumber } from 'ethers';
import { fetchEnsAddress } from '../../../ambient-utils/api';
import IconWithTooltip from '../../Global/IconWithTooltip/IconWithTooltip';
import useMediaQuery from '../../../utils/hooks/useMediaQuery';
import { CrocEnvContext } from '../../../contexts/CrocEnvContext';
import { ChainDataContext } from '../../../contexts/ChainDataContext';

import { FlexContainer } from '../../../styled/Common';

import {
    PortfolioControlContainer,
    PortfolioInfoText,
    PortfolioMotionContainer,
    PortfolioMotionSubContainer,
} from '../../../styled/Components/Portfolio';
import { UserDataContext } from '../../../contexts/UserDataContext';
import { TokenBalanceContext } from '../../../contexts/TokenBalanceContext';
import { TradeDataContext } from '../../../contexts/TradeDataContext';

interface propsIF {
    fullLayoutActive: boolean;
    setFullLayoutActive: Dispatch<SetStateAction<boolean>>;
    setTokenModalOpen?: Dispatch<SetStateAction<boolean>>;
    isModalView?: boolean;
}

export default function ExchangeBalance(props: propsIF) {
    const {
        fullLayoutActive,
        setFullLayoutActive,
        isModalView = false,
        setTokenModalOpen = () => null,
    } = props;

    const { mainnetProvider } = useContext(CrocEnvContext);

    const { soloToken: selectedToken } = useContext(TradeDataContext);

    const { userAddress } = useContext(UserDataContext);

    const { crocEnv } = useContext(CrocEnvContext);
    const { lastBlockNumber } = useContext(ChainDataContext);
    const { setTokenBalance } = useContext(TokenBalanceContext);

    const [tokenAllowance, setTokenAllowance] = useState<string>('');
    const [recheckTokenAllowance, setRecheckTokenAllowance] =
        useState<boolean>(false);
    const [recheckTokenBalances, setRecheckTokenBalances] =
        useState<boolean>(false);

    const [tokenWalletBalance, setTokenWalletBalance] = useState<string>('');
    const [tokenDexBalance, setTokenDexBalance] = useState<string>('');

    const [sendToAddress, setSendToAddress] = useState<string | undefined>();
    const [resolvedAddress, setResolvedAddress] = useState<
        string | undefined
    >();

    const isSendToAddressEns = sendToAddress?.endsWith('.eth');
    const isSendToAddressHex =
        sendToAddress?.startsWith('0x') && sendToAddress?.length == 42;

    const selectedTokenAddress = selectedToken.address;
    const selectedTokenDecimals = selectedToken.decimals;

    useEffect(() => {
        setTokenWalletBalance('');
        setTokenDexBalance('');
    }, [selectedToken.address, userAddress]);

    useEffect(() => {
        if (crocEnv && selectedToken.address && userAddress) {
            crocEnv
                .token(selectedToken.address)
                .wallet(userAddress)

                .then((bal: BigNumber) => {
                    setTokenWalletBalance(bal.toString());

                    setTokenBalance({
                        tokenAddress: selectedToken.address,
                        walletBalance: bal.toString(),
                    });
                })
                .catch(console.error);

            crocEnv
                .token(selectedToken.address)
                .balance(userAddress)
                .then((bal: BigNumber) => {
                    setTokenDexBalance(bal.toString());

                    setTokenBalance({
                        tokenAddress: selectedToken.address,
                        dexBalance: bal.toString(),
                    });
                })
                .catch(console.error);
        }
    }, [
        crocEnv,
        selectedToken.address,
        userAddress,
        lastBlockNumber,
        recheckTokenBalances,
    ]);

    useEffect(() => {
        (async () => {
            if (crocEnv && userAddress && selectedTokenAddress) {
                try {
                    const allowance = await crocEnv
                        .token(selectedTokenAddress)
                        .allowance(userAddress);
                    setTokenAllowance(allowance.toString());
                } catch (err) {
                    console.warn(err);
                }
                setRecheckTokenAllowance(false);
            }
        })();
    }, [
        crocEnv,
        selectedTokenAddress,
        lastBlockNumber,
        userAddress,
        recheckTokenAllowance,
    ]);

    useEffect(() => {
        (async () => {
            if (sendToAddress && isSendToAddressEns && mainnetProvider) {
                const newResolvedAddress = await mainnetProvider.resolveName(
                    sendToAddress,
                );

                if (newResolvedAddress) {
                    setResolvedAddress(newResolvedAddress);
                } else {
                    setResolvedAddress(undefined);
                }
            } else if (
                sendToAddress &&
                isSendToAddressHex &&
                !isSendToAddressEns
            ) {
                setResolvedAddress(sendToAddress);
            } else {
                setResolvedAddress(undefined);
            }
        })();
    }, [
        sendToAddress,
        isSendToAddressHex,
        isSendToAddressEns,
        mainnetProvider,
    ]);

    const [secondaryEnsName, setSecondaryEnsName] = useState<
        string | undefined
    >();

    // check for ENS name
    useEffect(() => {
        (async () => {
            if (
                sendToAddress &&
                isSendToAddressHex &&
                sendToAddress.length === 42 &&
                sendToAddress.startsWith('0x')
            ) {
                try {
                    const ensName = await fetchEnsAddress(sendToAddress);
                    if (ensName) {
                        setSecondaryEnsName(ensName);
                    } else setSecondaryEnsName(undefined);
                } catch (error) {
                    setSecondaryEnsName(undefined);
                    console.error({ error });
                }
            } else {
                setSecondaryEnsName(undefined);
            }
        })();
    }, [sendToAddress, isSendToAddressHex]);

    const accountData = [
        {
            label: 'Deposit',
            content: (
                <Deposit
                    selectedToken={selectedToken}
                    tokenAllowance={tokenAllowance}
                    tokenWalletBalance={tokenWalletBalance}
                    setRecheckTokenAllowance={setRecheckTokenAllowance}
                    setRecheckTokenBalances={setRecheckTokenBalances}
                    selectedTokenDecimals={selectedTokenDecimals}
                    setTokenModalOpen={setTokenModalOpen}
                />
            ),
            icon: depositImage,
        },
        {
            label: 'Withdraw',
            content: (
                <Withdraw
                    selectedToken={selectedToken}
                    tokenDexBalance={tokenDexBalance}
                    setRecheckTokenBalances={setRecheckTokenBalances}
                    sendToAddress={sendToAddress}
                    resolvedAddress={resolvedAddress}
                    setSendToAddress={setSendToAddress}
                    secondaryEnsName={secondaryEnsName}
                    setTokenModalOpen={setTokenModalOpen}
                />
            ),
            icon: withdrawImage,
        },
        {
            label: 'Transfer',
            content: (
                <Transfer
                    selectedToken={selectedToken}
                    tokenDexBalance={tokenDexBalance}
                    setRecheckTokenBalances={setRecheckTokenBalances}
                    sendToAddress={sendToAddress}
                    resolvedAddress={resolvedAddress}
                    setSendToAddress={setSendToAddress}
                    secondaryEnsName={secondaryEnsName}
                    setTokenModalOpen={setTokenModalOpen}
                />
            ),
            icon: transferImage,
        },
    ];

    const exchangeControl = (
        <PortfolioControlContainer
            id='portfolio_sidebar_toggle'
            onClick={() => setFullLayoutActive(!fullLayoutActive)}
        >
            <IconWithTooltip title='Exchange Balance' placement='bottom'>
                <img
                    src={closeSidebarImage}
                    style={{ rotate: fullLayoutActive ? '180deg' : undefined }}
                    alt='toggleSidebar'
                    width='20px'
                />
            </IconWithTooltip>
        </PortfolioControlContainer>
    );

    const columnView = useMediaQuery('(max-width: 1200px)');

    return (
        <>
            <PortfolioMotionContainer
                animate={
                    columnView ? 'open' : fullLayoutActive ? 'closed' : 'open'
                }
                fullWidth
                flexDirection='column'
                alignItems='center'
                background='dark1'
                rounded
                fullHeight
                xl={{ maxWidth: '400px' }}
            >
                <PortfolioMotionSubContainer
                    fullHeight
                    fullWidth
                    alignItems='center'
                    rounded
                    id='subcont'
                >
                    <FlexContainer
                        fullHeight
                        fullWidth
                        rounded
                        background='dark1'
                        justifyContent='center'
                        position='relative'
                    >
                        {(!fullLayoutActive || columnView || isModalView) && (
                            <TabComponent
                                data={accountData}
                                rightTabOptions={false}
                                isModalView={isModalView}
                                shouldSyncWithTradeModules={false}
                            />
                        )}
                        {!isModalView && exchangeControl}
                    </FlexContainer>
                </PortfolioMotionSubContainer>
                {(!fullLayoutActive || columnView || isModalView) && (
                    <PortfolioInfoText>
                        Collateral deposited into the Ambient Finance exchange
                        can be traded at lower gas costs and withdrawn at any
                        time.
                    </PortfolioInfoText>
                )}
            </PortfolioMotionContainer>
        </>
    );
}
