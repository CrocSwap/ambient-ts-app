import { useContext } from 'react';
import { ChainDataContext } from '../../../../../contexts/ChainDataContext';
import {
    ambiLogo,
    blastLogo,
} from '../../../../RangeDetails/PriceInfo/PriceInfo';
import PointsRow from './PointsRow';
import {
    BlastUserXpDataIF,
    UserDataContext,
    UserXpDataIF,
} from '../../../../../contexts/UserDataContext';
import { ViewMoreButton } from '../../../../../styled/Components/TransactionTable';
import { FlexContainer } from '../../../../../styled/Common';
import { Link } from 'react-router-dom';

interface propsIF {
    resolvedUserXp: UserXpDataIF;
    resolvedUserBlastXp: BlastUserXpDataIF;
    connectedAccountActive: boolean;
}

export default function Points(props: propsIF) {
    const { resolvedUserXp, resolvedUserBlastXp, connectedAccountActive } =
        props;
    const { isActiveNetworkBlast } = useContext(ChainDataContext);
    const { ensName } = useContext(UserDataContext);

    // since we're only going to do a set number of finite rows, they can be instantiated
    // ... on an individual basis in the return statement of the function

    const { connectedUserXp, connectedUserBlastXp } =
        useContext(ChainDataContext);
    const { userAddress, resolvedAddressFromContext } =
        useContext(UserDataContext);

    const linkToNavigateTo =
        connectedAccountActive && ensName
            ? `/${ensName}/xp`
            : resolvedAddressFromContext
            ? `/${resolvedAddressFromContext}/xp`
            : `/${userAddress}/xp`;

    return (
        <div>
            <div>
                <PointsRow
                    shortName={'AMBI'}
                    longName={'Ambient Points'}
                    pointsAccrued={
                        connectedAccountActive
                            ? connectedUserXp.dataReceived === true
                                ? (
                                      connectedUserXp.data?.globalPoints ?? 0
                                  ).toLocaleString()
                                : '...'
                            : resolvedUserXp.dataReceived === true
                            ? (
                                  resolvedUserXp.data?.globalPoints ?? 0
                              ).toLocaleString()
                            : '...'
                    }
                    logo={ambiLogo}
                />
            </div>
            {isActiveNetworkBlast ? (
                <div>
                    <div>
                        <PointsRow
                            shortName={'BLAST'}
                            longName={'Blast Points'}
                            pointsAccrued={
                                connectedAccountActive
                                    ? connectedUserBlastXp.dataReceived === true
                                        ? connectedUserBlastXp.data?.points ??
                                          '0'
                                        : '...'
                                    : resolvedUserBlastXp.dataReceived === true
                                    ? resolvedUserBlastXp.data?.points ?? '0'
                                    : '...'
                            }
                            logo={blastLogo}
                        />
                    </div>
                    <div>
                        <PointsRow
                            shortName={'BLAST'}
                            longName={'Blast Gold'}
                            pointsAccrued={
                                connectedAccountActive
                                    ? connectedUserBlastXp.dataReceived === true
                                        ? connectedUserBlastXp.data?.gold ?? '0'
                                        : '...'
                                    : resolvedUserBlastXp.dataReceived === true
                                    ? resolvedUserBlastXp.data?.gold ?? '0'
                                    : '...'
                            }
                            logo={blastLogo}
                        />
                    </div>
                </div>
            ) : undefined}
            <Link to={linkToNavigateTo}>
                <FlexContainer
                    justifyContent='center'
                    alignItems='center'
                    padding='8px'
                >
                    <ViewMoreButton>View Details</ViewMoreButton>
                </FlexContainer>
            </Link>
            <Link to={'/faq'}>
                <FlexContainer
                    justifyContent='center'
                    alignItems='center'
                    padding='8px'
                >
                    <ViewMoreButton>View FAQ</ViewMoreButton>
                </FlexContainer>
            </Link>
        </div>
    );
}
