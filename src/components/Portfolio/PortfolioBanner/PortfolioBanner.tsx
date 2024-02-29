// START: Import React and Dongles
import Jazzicon, { jsNumberForAddress } from 'react-jazzicon';

// START: Import JSX Components
import PortfolioBannerAccount from './PortfolioBannerAccount/PortfolioBannerAccount';

// START: Import Other Local Files
import { trimString } from '../../../ambient-utils/dataLayer';
import {
    PortfolioBannerLevelContainer,
    PortfolioBannerRectangleContainer,
} from '../../../styled/Components/Portfolio';
import accountImage from '../../../assets/images/backgrounds/account_image.svg';
import {
    UserDataContext,
    UserXpDataIF,
} from '../../../contexts/UserDataContext';
import { useContext } from 'react';
import UserLevelDisplay from '../../Global/LevelsCard/UserLevelDisplay';
import { ChainDataContext } from '../../../contexts/ChainDataContext';
interface propsIF {
    ensName: string;
    resolvedAddress: string;
    connectedAccountActive: boolean;
    resolvedUserXp: UserXpDataIF;
}

export default function PortfolioBanner(props: propsIF) {
    const { ensName, resolvedAddress, connectedAccountActive, resolvedUserXp } =
        props;
    const { userAddress } = useContext(UserDataContext);
    const { connectedUserXp } = useContext(ChainDataContext);

    const xpData =
        connectedAccountActive || location.pathname === '/account/xp'
            ? connectedUserXp
            : resolvedUserXp;

    const ensNameAvailable = ensName !== '';

    const jazziconsSeed = resolvedAddress
        ? resolvedAddress.toLowerCase()
        : userAddress?.toLowerCase() ?? '';

    const myJazzicon = (
        <Jazzicon diameter={50} seed={jsNumberForAddress(jazziconsSeed)} />
    );

    const truncatedAccountAddress = connectedAccountActive
        ? trimString(userAddress ?? '', 6, 6, '…')
        : trimString(resolvedAddress, 6, 6, '…');

    const jazziconsToDisplay =
        (resolvedAddress || connectedAccountActive) && myJazzicon
            ? myJazzicon
            : null;

    const userLink = ensName ?? userAddress;

    return (
        <PortfolioBannerRectangleContainer
            style={{ backgroundImage: `url(${accountImage})` }}
        >
            <PortfolioBannerAccount
                ensName={ensName}
                ensNameAvailable={ensNameAvailable}
                resolvedAddress={resolvedAddress}
                truncatedAccountAddress={truncatedAccountAddress}
                jazziconsToDisplay={jazziconsToDisplay}
            />
            <PortfolioBannerLevelContainer>
                <UserLevelDisplay
                    currentLevel={xpData?.data?.currentLevel}
                    globalPoints={xpData?.data?.globalPoints}
                    user={userLink}
                />
            </PortfolioBannerLevelContainer>
        </PortfolioBannerRectangleContainer>
    );
}
