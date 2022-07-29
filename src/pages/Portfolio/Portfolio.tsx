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

interface PortfolioPropsIF {
    ensName: string;
    connectedAccount: string;
    userImageData: string[];
}

// const cachedFetchAddress = memoizePromiseFn(fetchAddress);

export default function Portfolio(props: PortfolioPropsIF) {
    const { Moralis } = useMoralis();

    const { ensName, userImageData, connectedAccount } = props;

    const { address } = useParams();

    const [secondaryImageData, setSecondaryImageData] = useState<string[]>([]);

    useEffect(() => {
        (async () => {
            if (address && Moralis.Web3API) {
                const imageLocalURLs = await getNFTs(address);
                if (imageLocalURLs) setSecondaryImageData(imageLocalURLs);
            }
        })();
    }, [address, Moralis.Web3API]);

    const [secondaryensName, setSecondaryEnsName] = useState('');

    // check for ENS name account changes
    useEffect(() => {
        (async () => {
            if (address && Moralis.Web3API) {
                try {
                    const ensName = await fetchAddress(address);
                    if (ensName) setSecondaryEnsName(ensName);
                    else setSecondaryEnsName('');
                } catch (error) {
                    setSecondaryEnsName('');
                    console.log({ error });
                }
            }
        })();
    }, [address, Moralis.Web3API]);

    return (
        <main data-testid={'portfolio'} className={styles.portfolio_container}>
            <PortfolioBanner
                ensName={address ? secondaryensName : ensName}
                activeAccount={address ?? connectedAccount}
                imageData={address ? secondaryImageData : userImageData}
            />
            <PortfolioTabs />
            <div className={styles.title}>Exchange Balance</div>
            <div className={styles.exchange_balance}>
                <ExchangeBalance />
            </div>
        </main>
    );
}
