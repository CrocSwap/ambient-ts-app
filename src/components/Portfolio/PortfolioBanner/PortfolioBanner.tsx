// START: Import React and Dongles
import Jazzicon, { jsNumberForAddress } from 'react-jazzicon';

// START: Import JSX Components
import PortfolioBannerAccount from './PortfolioBannerAccount/PortfolioBannerAccount';

// START: Import Other Local Files
import trimString from '../../../utils/functions/trimString';
import { PortfolioBannerRectangleContainer } from '../../../styled/Components/Portfolio';
import accountImage from '../../../assets/images/backgrounds/account_image.svg';
import { UserDataContext } from '../../../contexts/UserDataContext';
import { useContext } from 'react';
interface propsIF {
    ensName: string;
    resolvedAddress: string;
    connectedAccountActive: boolean;
}

export default function PortfolioBanner(props: propsIF) {
    const { ensName, resolvedAddress, connectedAccountActive } = props;
    const { userAddress } = useContext(UserDataContext);

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
        </PortfolioBannerRectangleContainer>
    );
}
