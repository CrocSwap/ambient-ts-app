// START: Import React and Dongles
import { Dispatch, SetStateAction } from 'react';
import Blockies from 'react-blockies';
import { ChainSpec } from '@crocswap-libs/sdk';

// START: Import JSX Components
import PortfolioBannerAccount from './PortfolioBannerAccount/PortfolioBannerAccount';

// START: Import Other Local Files
import styles from './PortfolioBanner.module.css';
import trimString from '../../../utils/functions/trimString';

interface propsIF {
    ensName: string;
    activeAccount: string;
    imageData: string[];
    resolvedAddress: string;
    setShowProfileSettings: Dispatch<SetStateAction<boolean>>;
    connectedAccountActive: boolean;
    chainData: ChainSpec;
}

export default function PortfolioBanner(props: propsIF) {
    const {
        ensName,
        activeAccount,
        imageData,
        resolvedAddress,
        connectedAccountActive,
        chainData,
    } = props;
    const ensNameAvailable = ensName !== '';

    const blockiesSeed = resolvedAddress
        ? resolvedAddress.toLowerCase()
        : activeAccount.toLowerCase();

    const myBlockies = <Blockies seed={blockiesSeed} scale={7.4} />;

    const truncatedAccountAddress = connectedAccountActive
        ? trimString(activeAccount, 6, 6, '…')
        : trimString(resolvedAddress, 6, 6, '…');

    const blockiesToDisplay =
        (resolvedAddress || connectedAccountActive) && myBlockies
            ? myBlockies
            : null;

    return (
        <div className={styles.rectangle_container}>
            <PortfolioBannerAccount
                imageData={imageData}
                ensName={ensName}
                ensNameAvailable={ensNameAvailable}
                resolvedAddress={resolvedAddress}
                activeAccount={activeAccount}
                truncatedAccountAddress={truncatedAccountAddress}
                connectedAccountActive={connectedAccountActive}
                blockiesToDisplay={blockiesToDisplay}
                chainData={chainData}
            />
            {/* <div className={styles.nft_container}>
                {imageData.slice(1, 3).map((image: string) => (
                    <img
                        src={image}
                        alt='nft'
                        key={`nft-image-${JSON.stringify(image)}`}
                    />
                ))}
            </div> */}
        </div>
    );
}
