import styles from './Range.module.css';
import RangeCardHeader from './RangeCardHeader';
import RangeCard from './RangeCard';
import { PositionIF } from '../../../../../utils/interfaces/exports';

interface propsIF {
    positions: PositionIF[];
}

export default function Range(props: propsIF) {
    const { positions } = props;

    // TODO:   @Junior  I don't think there's any reason for the header element in
    // TODO:   ... the return statement to be abstracted into its own file as it
    // TODO:   ... appears to be fully static, please code it locally in this file
    // TODO:   ... and make sure that it is a <header> semantic element  --Emily

    return (
        <div className={styles.container}>
            <RangeCardHeader />
            {positions.map((position) => (
                <RangeCard key={JSON.stringify(position)} position={position} />
            ))}
        </div>
    );
}
