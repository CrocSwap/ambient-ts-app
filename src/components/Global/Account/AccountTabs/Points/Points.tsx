import PointsRow from './PointsRow';

export default function Points() {
    // since we're only going to do a set number of finite rows, they can be instantiated
    // ... on an individual basis in the return statement of the function
    return (
        <div>
            <PointsRow
                shortName={'AMBI'}
                longName={'Ambient Points'}
                pointsAccrued={500}
            />
        </div>
    );
}
