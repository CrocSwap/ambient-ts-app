import ExchangeBalance from '../../components/Portfolio/EchangeBalance/ExchangeBalance';
import PortfolioBanner from '../../components/Portfolio/PortfolioBanner/PortfolioBanner';
import PortfolioTabs from '../../components/Portfolio/PortfolioTabs/PortfolioTabs';
import styles from './Portfolio.module.css';
import { useParams } from 'react-router-dom';
import { getNFTs } from '../../App/functions/getNFTs';
import { useEffect, useState } from 'react';
// import { memoizePromiseFn } from '../../App/functions/memoizePromiseFn';
import { fetchAddress } from '../../App/functions/fetchAddress';
import { useMoralis } from 'react-moralis';
import { ethers } from 'ethers';

interface PortfolioPropsIF {
    ensName: string;
    connectedAccount: string;
    userImageData: string[];
    chainId: string;
}

const mainnetProvider = new ethers.providers.JsonRpcProvider(
    'https://mainnet.infura.io/v3/cbb2856ea8804fc5ba59be0a2e8a9f88',
);

// const cachedFetchAddress = memoizePromiseFn(fetchAddress);

export default function Portfolio(props: PortfolioPropsIF) {
    const { isInitialized } = useMoralis();

    const { ensName, userImageData, connectedAccount, chainId } = props;

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
    }, [resolvedAddress, address, chainId, isInitialized]);

    const [secondaryensName, setSecondaryEnsName] = useState('');

    // check for ENS name account changes
    useEffect(() => {
        (async () => {
            if (address && isInitialized) {
                try {
                    const ensName = await fetchAddress(address, chainId);
                    if (ensName) setSecondaryEnsName(ensName);
                    else setSecondaryEnsName('');
                } catch (error) {
                    setSecondaryEnsName('');
                    console.log({ error });
                }
            }
        })();
    }, [address, chainId, isInitialized]);

    const connectedAccountActive =
        !address || resolvedAddress.toLowerCase() === connectedAccount.toLowerCase();

    const exchangeBalanceComponent = (
        <div>
            <div className={styles.title}>Exchange Balance</div>
            <div className={styles.exchange_balance}>
                <ExchangeBalance />
            </div>
        </div>
    );
    return (
        <main data-testid={'portfolio'} className={styles.portfolio_container}>
            <PortfolioBanner
                ensName={address ? secondaryensName : ensName}
                resolvedAddress={resolvedAddress}
                activeAccount={address ?? connectedAccount}
                imageData={address ? secondaryImageData : userImageData}
            />
            <PortfolioTabs
                resolvedAddress={resolvedAddress}
                activeAccount={address ?? connectedAccount}
                connectedAccountActive={connectedAccountActive}
                chainId={chainId}
            />
            {connectedAccountActive ? exchangeBalanceComponent : null}
        </main>
    );
}
