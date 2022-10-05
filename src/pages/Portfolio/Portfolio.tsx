import ExchangeBalance from '../../components/Portfolio/EchangeBalance/ExchangeBalance';
import PortfolioBanner from '../../components/Portfolio/PortfolioBanner/PortfolioBanner';
import PortfolioTabs from '../../components/Portfolio/PortfolioTabs/PortfolioTabs';
import styles from './Portfolio.module.css';
import { useParams } from 'react-router-dom';
import { getNFTs } from '../../App/functions/getNFTs';
import { useEffect, useState, Dispatch, SetStateAction } from 'react';
import { fetchAddress } from '../../App/functions/fetchAddress';
import { useMoralis } from 'react-moralis';
import { ethers } from 'ethers';
import { TokenIF } from '../../utils/interfaces/TokenIF';
import { CrocEnv, toDisplayQty } from '@crocswap-libs/sdk';

import { Erc20TokenBalanceFn, nativeTokenBalanceFn } from '../../App/functions/fetchTokenBalances';
import {
    // useAppDispatch,
    useAppSelector,
} from '../../utils/hooks/reduxToolkit';
import { TokenPriceFn } from '../../App/functions/fetchTokenPrice';
import NotFound from '../NotFound/NotFound';
import ProfileSettings from '../../components/Portfolio/ProfileSettings/ProfileSettings';
// import { useModal } from '../../components/Global/Modal/useModal';
// import Modal from '../../components/Global/Modal/Modal';
// import { defaultTokens } from '../../utils/data/defaultTokens';
// import { setToken } from '../../utils/state/temp';

const mainnetProvider = new ethers.providers.WebSocketProvider(
    'wss://mainnet.infura.io/ws/v3/4a162c75bd514925890174ca13cdb6a2',
);

interface PortfolioPropsIF {
    crocEnv: CrocEnv | undefined;
    provider: ethers.providers.Provider | undefined;
    cachedFetchNativeTokenBalance: nativeTokenBalanceFn;
    cachedFetchErc20TokenBalances: Erc20TokenBalanceFn;
    cachedFetchTokenPrice: TokenPriceFn;
    importedTokens: TokenIF[];
    ensName: string;
    lastBlockNumber: number;
    connectedAccount: string;
    userImageData: string[];
    chainId: string;
    tokenMap: Map<string, TokenIF>;

    selectedOutsideTab: number;
    setSelectedOutsideTab: Dispatch<SetStateAction<number>>;
    outsideControl: boolean;
    setOutsideControl: Dispatch<SetStateAction<boolean>>;
    userAccount?: boolean;
    openGlobalModal: (content: React.ReactNode, title?: string) => void;
    closeGlobalModal: () => void;
}

// const cachedFetchAddress = memoizePromiseFn(fetchAddress);

export default function Portfolio(props: PortfolioPropsIF) {
    const { isInitialized } = useMoralis();

    const {
        crocEnv,
        provider,
        cachedFetchNativeTokenBalance,
        cachedFetchErc20TokenBalances,
        cachedFetchTokenPrice,
        importedTokens,
        ensName,
        lastBlockNumber,
        userImageData,
        connectedAccount,
        chainId,
        tokenMap,
        openGlobalModal,
        closeGlobalModal,
        userAccount,
    } = props;

    const selectedToken: TokenIF = useAppSelector((state) => state.temp.token);

    const [tokenAllowance, setTokenAllowance] = useState<string>('');
    const [recheckTokenAllowance, setRecheckTokenAllowance] = useState<boolean>(false);

    const selectedTokenAddress = selectedToken.address;
    const selectedTokenDecimals = selectedToken.decimals;
    useEffect(() => {
        (async () => {
            if (crocEnv && connectedAccount && selectedTokenAddress) {
                try {
                    const allowance = await crocEnv
                        .token(selectedTokenAddress)
                        .allowance(connectedAccount);
                    setTokenAllowance(toDisplayQty(allowance, selectedTokenDecimals));
                } catch (err) {
                    console.log(err);
                }
                setRecheckTokenAllowance(false);
            }
        })();
    }, [crocEnv, selectedTokenAddress, lastBlockNumber, connectedAccount, recheckTokenAllowance]);

    const { address } = useParams();

    const isAddressEns = address?.endsWith('.eth');
    const isAddressHex = address?.startsWith('0x') && address?.length == 42;

    if (address && !isAddressEns && !isAddressHex) return <NotFound />;
    // if (address && !isAddressEns && !isAddressHex) return <Navigate replace to='/404' />;

    const [resolvedAddress, setResolvedAddress] = useState<string>('');

    const connectedAccountActive =
        !address || resolvedAddress.toLowerCase() === connectedAccount.toLowerCase();

    useEffect(() => {
        (async () => {
            if (address && isAddressEns && mainnetProvider) {
                const newResolvedAddress = await mainnetProvider.resolveName(address);

                if (newResolvedAddress) {
                    setResolvedAddress(newResolvedAddress);
                }
            } else if (address && isAddressHex && !isAddressEns) {
                setResolvedAddress(address);
            }
        })();
    }, [address, isAddressHex, isAddressEns, mainnetProvider]);

    const [secondaryImageData, setSecondaryImageData] = useState<string[]>([]);

    useEffect(() => {
        (async () => {
            if (resolvedAddress && isInitialized && !connectedAccountActive) {
                const imageLocalURLs = await getNFTs(resolvedAddress);
                if (imageLocalURLs) setSecondaryImageData(imageLocalURLs);
            }
            // else if (address && isAddressHex && !isAddressEns && isInitialized) {
            //     const imageLocalURLs = await getNFTs(address);
            //     if (imageLocalURLs) setSecondaryImageData(imageLocalURLs);
            // }
        })();
    }, [resolvedAddress, isInitialized, connectedAccountActive]);

    const [secondaryensName, setSecondaryEnsName] = useState('');

    // check for ENS name account changes
    useEffect(() => {
        (async () => {
            if (address && isInitialized && !isAddressEns) {
                try {
                    const ensName = await fetchAddress(mainnetProvider, address, chainId);
                    if (ensName) setSecondaryEnsName(ensName);
                    else setSecondaryEnsName('');
                } catch (error) {
                    setSecondaryEnsName('');
                    console.log({ error });
                }
            }
        })();
    }, [address, isInitialized, isAddressEns]);

    useEffect(() => {
        console.log({ selectedToken });
    }, [selectedToken]);

    const exchangeBalanceComponent = (
        <div className={styles.exchange_balance}>
            <ExchangeBalance
                crocEnv={crocEnv}
                connectedAccount={connectedAccount}
                setSelectedOutsideTab={props.setSelectedOutsideTab}
                setOutsideControl={props.setOutsideControl}
                openGlobalModal={openGlobalModal}
                closeGlobalModal={closeGlobalModal}
                selectedToken={selectedToken}
                tokenAllowance={tokenAllowance}
                setRecheckTokenAllowance={setRecheckTokenAllowance}
            />
        </div>
    );
    const [fullLayoutActive, setFullLayoutActive] = useState(false);

    useEffect(() => {
        !connectedAccountActive ? setFullLayoutActive(true) : setFullLayoutActive(false);
    }, [connectedAccountActive]);

    // useEffect(() => {
    //     !props.userAccount ? setFullLayoutActive(true) : null;
    // }, [props.userAccount]);

    const connectedUserNativeToken = useAppSelector((state) => state.userData.tokens.nativeToken);
    const connectedUserErc20Tokens = useAppSelector((state) => state.userData.tokens.erc20Tokens);

    const connectedUserTokens = [connectedUserNativeToken].concat(connectedUserErc20Tokens);

    const [resolvedAddressNativeToken, setResolvedAddressNativeToken] = useState<
        TokenIF | undefined
    >();
    const [resolvedAddressErc20Tokens, setResolvedAddressErc20Tokens] = useState<TokenIF[]>([]);

    const resolvedAddressTokens = [resolvedAddressNativeToken].concat(resolvedAddressErc20Tokens);

    useEffect(() => {
        (async () => {
            if (
                crocEnv &&
                resolvedAddress &&
                chainId &&
                lastBlockNumber &&
                !connectedAccountActive
            ) {
                try {
                    // console.log('fetching native token balance');
                    const newNativeToken = await cachedFetchNativeTokenBalance(
                        resolvedAddress,
                        chainId,
                        lastBlockNumber,
                        crocEnv,
                    );

                    if (
                        JSON.stringify(resolvedAddressNativeToken) !==
                        JSON.stringify(newNativeToken)
                    ) {
                        setResolvedAddressNativeToken(newNativeToken);
                    }
                } catch (error) {
                    console.log({ error });
                }
                try {
                    const updatedTokens: TokenIF[] = resolvedAddressErc20Tokens;

                    // console.log('fetching resolved user erc20 token balances');
                    const erc20Results = await cachedFetchErc20TokenBalances(
                        resolvedAddress,
                        chainId,
                        lastBlockNumber,
                        crocEnv,
                    );

                    erc20Results.map((newToken: TokenIF) => {
                        const indexOfExistingToken = resolvedAddressErc20Tokens.findIndex(
                            (existingToken) => existingToken.address === newToken.address,
                        );

                        if (indexOfExistingToken === -1) {
                            updatedTokens.push(newToken);
                        } else if (
                            JSON.stringify(resolvedAddressErc20Tokens[indexOfExistingToken]) !==
                            JSON.stringify(newToken)
                        ) {
                            updatedTokens[indexOfExistingToken] = newToken;
                        }
                    });
                    setResolvedAddressErc20Tokens(updatedTokens);
                } catch (error) {
                    console.log({ error });
                }
            }
        })();
    }, [crocEnv, resolvedAddress, chainId, lastBlockNumber, connectedAccountActive]);

    const [showProfileSettings, setShowProfileSettings] = useState(false);

    return (
        <main data-testid={'portfolio'} className={styles.portfolio_container}>
            {userAccount && showProfileSettings && (
                <ProfileSettings
                    showProfileSettings={showProfileSettings}
                    setShowProfileSettings={setShowProfileSettings}
                    ensName={address ? secondaryensName : ensName}
                    imageData={connectedAccountActive ? userImageData : secondaryImageData}
                    openGlobalModal={openGlobalModal}
                />
            )}
            {/* <button onClick={openTempModal}>Choose a Token</button> */}
            {/* <h3>{tempToken.name}</h3> */}
            <PortfolioBanner
                ensName={address ? secondaryensName : ensName}
                resolvedAddress={resolvedAddress}
                activeAccount={address ?? connectedAccount}
                imageData={connectedAccountActive ? userImageData : secondaryImageData}
                setShowProfileSettings={setShowProfileSettings}
            />
            <div
                className={
                    fullLayoutActive
                        ? styles.full_layout_container
                        : styles.tabs_exchange_balance_container
                }
            >
                <PortfolioTabs
                    crocEnv={crocEnv}
                    provider={provider}
                    cachedFetchTokenPrice={cachedFetchTokenPrice}
                    importedTokens={importedTokens}
                    connectedUserTokens={connectedUserTokens}
                    resolvedAddressTokens={resolvedAddressTokens}
                    resolvedAddress={resolvedAddress}
                    lastBlockNumber={lastBlockNumber}
                    activeAccount={address ?? connectedAccount}
                    connectedAccountActive={connectedAccountActive}
                    chainId={chainId}
                    tokenMap={tokenMap}
                    selectedOutsideTab={props.selectedOutsideTab}
                    setSelectedOutsideTab={props.setSelectedOutsideTab}
                    setOutsideControl={props.setOutsideControl}
                    outsideControl={props.outsideControl}
                    rightTabOptions={false}
                />
                {connectedAccountActive && !fullLayoutActive ? exchangeBalanceComponent : null}
            </div>
            {/* {modalOrNull} */}
        </main>
    );
}
