import { BsSortDown, BsSortUpAlt } from 'react-icons/bs';
import { directionType } from './useSortedPools';

interface propsIF {
    direction: directionType;
}

export default function AssignSort(props: propsIF) {
    const { direction } = props;
    return direction === 'ascending' ? <BsSortDown /> : <BsSortUpAlt />;
}
