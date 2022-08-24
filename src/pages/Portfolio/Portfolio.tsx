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

interface PortfolioPropsIF {
    ensName: string;
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

const mainnetProvider = new ethers.providers.JsonRpcProvider(
    'https://mainnet.infura.io/v3/cbb2856ea8804fc5ba59be0a2e8a9f88',
);

// const cachedFetchAddress = memoizePromiseFn(fetchAddress);

export default function Portfolio(props: PortfolioPropsIF) {
    const { isInitialized } = useMoralis();

    const { ensName, userImageData, connectedAccount, chainId, tokenMap } = props;

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
            if (address && isInitialized) {
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
    }, [address, isInitialized]);

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

    // const fullLayout = (
    //     <div
    //         className={`${styles.full_layout_svg} ${
    //             fullLayoutActive ? styles.active_layout_style : null
    //         }`}
    //         onClick={() => setFullLayoutActive(!fullLayoutActive)}
    //     />
    // );
    // const fullLayoutCopied = (
    //     <div
    //         className={`${styles.full_layout_svg_copied} ${
    //             !fullLayoutActive ? styles.active_layout_style : null
    //         }`}
    //     />
    // );
    // const halfLayout = (
    //     <div
    //         className={`${styles.half_layout_svg} ${
    //             !fullLayoutActive ? styles.active_layout_style : null
    //         }`}
    //     />
    // );

    // const sharedLayoutSVG = (
    //     <>
    //         <div
    //             className={styles.shared_layout_svg}
    //             onClick={() => setFullLayoutActive(!fullLayoutActive)}
    //         >
    //             {fullLayoutCopied}
    //             {halfLayout}
    //         </div>
    //     </>
    // );
    // const rightTabOptions = (
    //     <div className={styles.right_tab_option}>
    //         {fullLayout}
    //         {sharedLayoutSVG}
    //     </div>
    // );

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
                    resolvedAddress={resolvedAddress}
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
