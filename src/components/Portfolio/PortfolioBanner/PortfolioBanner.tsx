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
import { DefaultTooltip } from '../../Global/StyledTooltip/StyledTooltip';
import { AiOutlineDollarCircle } from 'react-icons/ai';
import { HeaderButtons } from '../../../styled/Components/Chart';
import { PoolContext } from '../../../contexts/PoolContext';
import { FlexContainer } from '../../../styled/Common';
import useMediaQuery from '../../../utils/hooks/useMediaQuery';
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
    const { isTradeDollarizationEnabled, setIsTradeDollarizationEnabled } =
        useContext(PoolContext);
    const isSmallScreen = useMediaQuery('(max-width: 800px)');

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
            <FlexContainer
                justifyContent={isSmallScreen ? 'flex-start' : 'flex-end'}
                alignItems='baseline'
                gap={16}
            >
                <PortfolioBannerAccount
                    ensName={ensName}
                    ensNameAvailable={ensNameAvailable}
                    resolvedAddress={resolvedAddress}
                    truncatedAccountAddress={truncatedAccountAddress}
                    jazziconsToDisplay={jazziconsToDisplay}
                />
                <DefaultTooltip
                    interactive
                    title={'Toggle USD Price Estimates'}
                    enterDelay={500}
                >
                    <HeaderButtons
                        mobileHide
                        onClick={() =>
                            setIsTradeDollarizationEnabled((prev) => !prev)
                        }
                        style={{ zIndex: '2' }}
                    >
                        <AiOutlineDollarCircle
                            size={20}
                            id='trade_dollarized_prices_button'
                            aria-label='Toggle dollarized prices button'
                            style={{
                                color: isTradeDollarizationEnabled
                                    ? 'var(--accent1)'
                                    : undefined,
                            }}
                        />
                    </HeaderButtons>
                </DefaultTooltip>
            </FlexContainer>

            <PortfolioBannerLevelContainer isAccountPage>
                <UserLevelDisplay
                    currentLevel={xpData?.data?.currentLevel}
                    globalPoints={xpData?.data?.globalPoints}
                    user={userLink}
                />
            </PortfolioBannerLevelContainer>
        </PortfolioBannerRectangleContainer>
    );
}
