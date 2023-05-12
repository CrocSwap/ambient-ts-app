// START: Import React and Dongles
import { Dispatch, SetStateAction } from 'react';
import Jazzicon, { jsNumberForAddress } from 'react-jazzicon';

import { ChainSpec } from '@crocswap-libs/sdk';

// START: Import JSX Components
import PortfolioBannerAccount from './PortfolioBannerAccount/PortfolioBannerAccount';

// START: Import Other Local Files
import styles from './PortfolioBanner.module.css';
import trimString from '../../../utils/functions/trimString';

interface propsIF {
    ensName: string;
    activeAccount: string;
    resolvedAddress: string;
    setShowProfileSettings: Dispatch<SetStateAction<boolean>>;
    connectedAccountActive: boolean;
    chainData: ChainSpec;
}

export default function PortfolioBanner(props: propsIF) {
    const {
        ensName,
        activeAccount,
        resolvedAddress,
        connectedAccountActive,
        chainData,
    } = props;
    const ensNameAvailable = ensName !== '';

    const jazziconsSeed = resolvedAddress
        ? resolvedAddress.toLowerCase()
        : activeAccount.toLowerCase();

    const myJazzicon = (
        <Jazzicon diameter={50} seed={jsNumberForAddress(jazziconsSeed)} />
    );

    const truncatedAccountAddress = connectedAccountActive
        ? trimString(activeAccount, 6, 6, '…')
        : trimString(resolvedAddress, 6, 6, '…');

    const jazziconsToDisplay =
        (resolvedAddress || connectedAccountActive) && myJazzicon
            ? myJazzicon
            : null;

    return (
        <div className={styles.rectangle_container}>
            <PortfolioBannerAccount
                ensName={ensName}
                ensNameAvailable={ensNameAvailable}
                resolvedAddress={resolvedAddress}
                activeAccount={activeAccount}
                truncatedAccountAddress={truncatedAccountAddress}
                connectedAccountActive={connectedAccountActive}
                jazziconsToDisplay={jazziconsToDisplay}
                chainData={chainData}
            />
        </div>
    );
}
