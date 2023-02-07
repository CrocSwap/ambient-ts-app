import styles from './RangeDetailsSimplify.module.css';
import { PositionIF } from '../../../utils/interfaces/exports';

interface ItemRowPropsIF {
    title: string;
    // eslint-disable-next-line
    content: any;
    explanation: string;
}

interface RangeDetailsSimplifyPropsIF {
    position: PositionIF;
    account: string;
}
export default function RangeDetailsSimplify(props: RangeDetailsSimplifyPropsIF) {
    const { account, position } = props;

    return <div></div>;
}
