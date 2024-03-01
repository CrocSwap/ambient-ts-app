import { useContext } from 'react';
import { ChainDataContext } from '../../../../../contexts/ChainDataContext';
import {
    ambiLogo,
    blastLogo,
} from '../../../../RangeDetails/PriceInfo/PriceInfo';
import PointsRow from './PointsRow';
import { UserXpDataIF } from '../../../../../contexts/UserDataContext';

interface propsIF {
    resolvedUserXp: UserXpDataIF;
    resolvedUserBlastPoints: UserXpDataIF;
    connectedAccountActive: boolean;
}

export default function Points(props: propsIF) {
    const { resolvedUserXp, resolvedUserBlastPoints, connectedAccountActive } =
        props;
    const { isActiveNetworkBlast } = useContext(ChainDataContext);

    // since we're only going to do a set number of finite rows, they can be instantiated
    // ... on an individual basis in the return statement of the function

    const { connectedUserXp } = useContext(ChainDataContext);

    const ambiGlobalPoints = connectedAccountActive
        ? connectedUserXp.data?.globalPoints !== undefined
            ? connectedUserXp.data?.globalPoints
            : '...'
        : resolvedUserXp.data?.globalPoints !== undefined
        ? resolvedUserXp.data?.globalPoints
        : '...';

    const blastPoints = connectedAccountActive
        ? connectedUserXp.data?.blastPoints !== undefined
            ? connectedUserXp.data?.blastPoints
            : '...'
        : resolvedUserBlastPoints.data?.blastPoints !== undefined
        ? resolvedUserBlastPoints.data?.blastPoints
        : '...';

    const blastGold = connectedAccountActive
        ? connectedUserXp.data?.blastPoints !== undefined
            ? connectedUserXp.data?.blastPoints
            : '..'
        : resolvedUserBlastPoints.data?.blastGold !== undefined
        ? resolvedUserBlastPoints.data?.blastGold
        : '...';

    return (
        <div>
            <div>
                <PointsRow
                    shortName={'AMBI'}
                    longName={'Ambient Points'}
                    pointsAccrued={ambiGlobalPoints.toLocaleString()}
                    logo={ambiLogo}
                />
            </div>
            {isActiveNetworkBlast ? (
                <div>
                    <div>
                        <PointsRow
                            shortName={'BLAST'}
                            longName={'Blast Points'}
                            pointsAccrued={blastPoints.toLocaleString()}
                            logo={blastLogo}
                        />
                    </div>
                    <div>
                        <PointsRow
                            shortName={'BLAST'}
                            longName={'Blast Gold'}
                            pointsAccrued={blastGold}
                            logo={blastLogo}
                        />
                    </div>
                </div>
            ) : undefined}
        </div>
    );
}
