import ExchangeBalance from '../../components/Portfolio/EchangeBalance/ExchangeBalance';
import PortfolioBanner from '../../components/Portfolio/PortfolioBanner/PortfolioBanner';
import PortfolioTabs from '../../components/Portfolio/PortfolioTabs/PortfolioTabs';
import styles from './Portfolio.module.css';
import { useParams } from 'react-router-dom';
import { getNFTs } from '../../App/functions/getNFTs';
import { useEffect, useState, Dispatch, SetStateAction } from 'react';
// import { memoizePromiseFn } from '../../App/functions/memoizePromiseFn';
import { fetchAddress } from '../../App/functions/fetchAddress';
import { useMoralis } from 'react-moralis';
import { ethers } from 'ethers';
import { TokenIF } from '../../utils/interfaces/TokenIF';
import { CrocEnv } from '@crocswap-libs/sdk';

import {
    memoizeFetchErc20TokenBalances,
    memoizeFetchNativeTokenBalance,
} from '../../App/functions/fetchTokenBalances';
import { useAppSelector } from '../../utils/hooks/reduxToolkit';

const cachedFetchErc20TokenBalances = memoizeFetchErc20TokenBalances();
const cachedFetchNativeTokenBalance = memoizeFetchNativeTokenBalance();

const mainnetProvider = new ethers.providers.WebSocketProvider(
    'wss://mainnet.infura.io/ws/v3/25e7e0ec71de48bfa9c4d2431fbb3c4a',
);

interface PortfolioPropsIF {
    crocEnv: CrocEnv | undefined;
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
}

// const cachedFetchAddress = memoizePromiseFn(fetchAddress);

export default function Portfolio(props: PortfolioPropsIF) {
    const { isInitialized } = useMoralis();

    const {
        crocEnv,
        ensName,
        lastBlockNumber,
        userImageData,
        connectedAccount,
        chainId,
        tokenMap,
    } = props;

    const { address } = useParams();

    const isAddressEns = address?.endsWith('.eth');

    const [resolvedAddress, setResolvedAddress] = useState<string>('');

    useEffect(() => {
        (async () => {
            if (address && isAddressEns && mainnetProvider) {
                const newResolvedAddress = await mainnetProvider.resolveName(address);

                if (newResolvedAddress) {
                    setResolvedAddress(newResolvedAddress);
                }
            } else if (address && !isAddressEns) {
                setResolvedAddress(address);
            }
        })();
    }, [address, isAddressEns, mainnetProvider]);

    const [secondaryImageData, setSecondaryImageData] = useState<string[]>([]);

    useEffect(() => {
        (async () => {
            if (resolvedAddress) {
                const imageLocalURLs = await getNFTs(resolvedAddress);
                if (imageLocalURLs) setSecondaryImageData(imageLocalURLs);
            } else if (address && isInitialized) {
                const imageLocalURLs = await getNFTs(address);
                if (imageLocalURLs) setSecondaryImageData(imageLocalURLs);
            }
        })();
    }, [resolvedAddress, address, isInitialized]);

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

    const connectedAccountActive =
        !address || resolvedAddress.toLowerCase() === connectedAccount.toLowerCase();

    const exchangeBalanceComponent = (
        <div className={styles.exchange_balance}>
            <ExchangeBalance
                setSelectedOutsideTab={props.setSelectedOutsideTab}
                setOutsideControl={props.setOutsideControl}
            />
        </div>
    );
    const [fullLayoutActive, setFullLayoutActive] = useState(false);

    useEffect(() => {
        !props.userAccount ? setFullLayoutActive(true) : null;
    }, [props.userAccount]);

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
            if (crocEnv && resolvedAddress && chainId) {
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
    }, [crocEnv, resolvedAddress, chainId, lastBlockNumber]);

    return (
        <main data-testid={'portfolio'} className={styles.portfolio_container}>
            <PortfolioBanner
                ensName={address ? secondaryensName : ensName}
                resolvedAddress={resolvedAddress}
                activeAccount={address ?? connectedAccount}
                imageData={address ? secondaryImageData : userImageData}
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
        </main>
    );
}
