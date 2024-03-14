import { BsSortDown, BsSortUpAlt } from 'react-icons/bs';
import { sortDirections } from '../../../ambient-utils/types';

interface propsIF {
    direction: sortDirections;
}

export default function AssignSort(props: propsIF) {
    const { direction } = props;
    return direction === 'ascending' ? <BsSortDown /> : <BsSortUpAlt />;
}
