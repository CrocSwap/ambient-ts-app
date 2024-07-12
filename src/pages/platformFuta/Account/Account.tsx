import BreadCrumb from '../../../components/Futa/Breadcrumb/Breadcrumb';
import styles from './Account.module.css';

import SearchableTicker from '../../../components/Futa/SearchableTicker/SearchableTicker';
import useMediaQuery from '../../../utils/hooks/useMediaQuery';
import Divider from '../../../components/Futa/Divider/FutaDivider';
import {
    sortedAuctionsIF,
    useSortedAuctions,
} from '../Auctions/useSortedAuctions';
import { useContext, useEffect, useMemo, useState } from 'react';
import { AuctionsContext } from '../../../contexts/AuctionsContext';
import { UserDataContext } from '../../../contexts/UserDataContext';
import Typewriter from '../../../components/Futa/TypeWriter/TypeWriter';
import { AppStateContext } from '../../../contexts/AppStateContext';
import { Navigate, Link, useParams } from 'react-router-dom';
import Seperator from '../../../components/Futa/Seperator/Seperator';
import TooltipLabel from '../../../components/Futa/TooltipLabel/TooltipLabel';
import { CrocEnvContext } from '../../../contexts/CrocEnvContext';

export default function Account() {
    const { accountData } = useContext(AuctionsContext);
    const { isUserConnected, userAddress } = useContext(UserDataContext);
    const { updateUserAuctionsList } = useContext(AuctionsContext);
    const {
        walletModal: { open: openWalletModal },
    } = useContext(AppStateContext);

    const {
        chainData: { chainId },
    } = useContext(CrocEnvContext);

    const { address: addressFromParams } = useParams();

    const isAddressEns = addressFromParams?.endsWith('.eth');
    const isAddressHex =
        addressFromParams?.startsWith('0x') && addressFromParams?.length == 42;

    const { mainnetProvider } = useContext(CrocEnvContext);

    const [resolvedAddress, setResolvedAddress] = useState<string | undefined>(
        undefined,
    );

    if (addressFromParams && !isAddressEns && !isAddressHex) {
        return <Navigate to='/404' replace />;
    }

    useEffect(() => {
        (async () => {
            if (addressFromParams && isAddressEns && mainnetProvider) {
                try {
                    const newResolvedAddress =
                        await mainnetProvider.resolveName(addressFromParams);
                    setResolvedAddress(newResolvedAddress ?? '');
                } catch (error) {
                    console.error({ error });
                }
            } else if (addressFromParams && isAddressHex && !isAddressEns) {
                setResolvedAddress(addressFromParams);
            } else {
                setResolvedAddress('');
            }
        })();
    }, [addressFromParams, isAddressHex, isAddressEns, mainnetProvider]);

    const cacheFrequency = Math.floor(Date.now() / 30000);

    useEffect(() => {
        if (resolvedAddress) {
            updateUserAuctionsList(resolvedAddress);
        } else if (userAddress) {
            updateUserAuctionsList(userAddress);
        }
    }, [resolvedAddress, userAddress, chainId, cacheFrequency]);

    const connectedAccountActive: boolean = useMemo(
        () =>
            userAddress
                ? addressFromParams
                    ? resolvedAddress
                        ? resolvedAddress?.toLowerCase() ===
                          userAddress.toLowerCase()
                            ? true
                            : false
                        : true
                    : true
                : false,
        [addressFromParams, resolvedAddress, userAddress],
    );

    const claimAllContainer = (
        <div className={styles.claimAllContainer}>
            <h3>CLAIM ALL</h3>
            <p className={styles.claimAllText}>
                CLAIM ALL TOKENS FROM WINNING AUCTIONS AND UNUSED BIDS
            </p>
            <div className={styles.extraFeeContainer}>
                <div className={styles.justifyRow}>
                    <TooltipLabel
                        itemTitle='NETWORK FEE'
                        tooltipTitle='NETWORK FEE PAID IN ORDER TO TRANSACT'
                    />
                    <p style={{ color: 'var(--text2)', fontSize: '14px' }}>
                        ~0.01
                    </p>
                </div>
            </div>
            <button
                className={`${styles.claimButton} ${styles.disabledButton}`}
            >
                CLAIM ALL
            </button>
        </div>
    );

    const connectWalletContent = (
        <div className={styles.connectWalletContent}>
            <Typewriter text='Connect your wallet to view your auctions' />
            <button onClick={openWalletModal}>Connect wallet</button>
        </div>
    );

    const noAuctionsContent = (
        <div className={styles.connectWalletContent}>
            <Typewriter text='No auctions found' />
            <p>Consider viewing all auctions</p>
            <Link to='/auctions'>All auctions</Link>
        </div>
    );
    const sorted: sortedAuctionsIF = useSortedAuctions(
        accountData.auctions || [],
    );
    const desktopScreen = useMediaQuery('(min-width: 1080px)');

    if (!isUserConnected && !addressFromParams) {
        return connectWalletContent;
    }

    if (!sorted?.data?.length) {
        return noAuctionsContent;
    }

    const desktopVersionWithClaimAll = (
        <div className={styles.desktopContainer}>
            <div className={styles.content}>
                <SearchableTicker
                    auctions={sorted}
                    title='account'
                    isAccount={true}
                />
            </div>
            <div className={styles.seperatorContainer}>
                <Seperator dots={70} />
            </div>

            <div className={styles.rightLayout}>
                <Divider count={2} />
                {claimAllContainer}
            </div>
        </div>
    );

    const desktopVersionWithoutClaimAll = (
        <div className={styles.container}>
            <div className={styles.content}>
                <SearchableTicker
                    auctions={sorted}
                    title='account'
                    isAccount={true}
                />
            </div>
        </div>
    );

    const mobileVersionWithClaimAll = (
        <div className={styles.container}>
            <div className={styles.content}>
                <BreadCrumb />
                <h2>Account</h2>
                <SearchableTicker auctions={sorted} isAccount={true} />
            </div>
            {claimAllContainer}
        </div>
    );

    const mobileVersionWithoutClaimAll = (
        <div className={styles.container}>
            <div className={styles.content}>
                <BreadCrumb />
                <h2>Account</h2>
                <SearchableTicker auctions={sorted} isAccount={true} />
            </div>
        </div>
    );

    return desktopScreen
        ? connectedAccountActive
            ? desktopVersionWithClaimAll
            : desktopVersionWithoutClaimAll
        : connectedAccountActive
          ? mobileVersionWithClaimAll
          : mobileVersionWithoutClaimAll;
}
