// START: Import React and Dongles
import Jazzicon, { jsNumberForAddress } from 'react-jazzicon';

// START: Import JSX Components
import PortfolioBannerAccount from './PortfolioBannerAccount/PortfolioBannerAccount';

// START: Import Other Local Files
import trimString from '../../../utils/functions/trimString';
import { useAppSelector } from '../../../utils/hooks/reduxToolkit';
import { RectangleContainer } from './PortfolioBanner.styles';
import accountImage from '../../../assets/images/backgrounds/account_image.svg';
interface propsIF {
    ensName: string;
    resolvedAddress: string;
    connectedAccountActive: boolean;
}

export default function PortfolioBanner(props: propsIF) {
    const { ensName, resolvedAddress, connectedAccountActive } = props;
    const { addressCurrent: userAddress } = useAppSelector(
        (state) => state.userData,
    );

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
        <RectangleContainer style={{ backgroundImage: `url(${accountImage})` }}>
            <PortfolioBannerAccount
                ensName={ensName}
                ensNameAvailable={ensNameAvailable}
                resolvedAddress={resolvedAddress}
                truncatedAccountAddress={truncatedAccountAddress}
                jazziconsToDisplay={jazziconsToDisplay}
            />
        </RectangleContainer>
    );
}
