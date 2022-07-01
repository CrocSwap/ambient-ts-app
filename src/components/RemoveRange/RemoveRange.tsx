import styles from './RemoveRange.module.css';
import RemoveRangeWidth from './RemoveRangeWidth/RemoveRangeWidth';
import RemoveRangeHeader from './RemoveRangeHeader/RemoveRangeHeader';
import RemoveRangeInfo from './RemoveRangeInfo/RemoveRangInfo';
import RemoveRangeButton from './RemoveRangeButton/RemoveRangeButton';
import { useState } from 'react';

interface IRemoveRangeProps {
    isPositionInRange: boolean;
    isAmbient: boolean;
    baseTokenSymbol: string;
    quoteTokenSymbol: string;
}

export default function RemoveRange(props: IRemoveRangeProps) {
    const [removalPercentage, setRemovalPercentage] = useState(100);

    return (
        <div className={styles.remove_Range_container}>
            <RemoveRangeHeader
                isPositionInRange={props.isPositionInRange}
                isAmbient={props.isAmbient}
                baseTokenSymbol={props.baseTokenSymbol}
                quoteTokenSymbol={props.quoteTokenSymbol}
            />
            <div className={styles.main_content}>
                <RemoveRangeWidth
                    removalPercentage={removalPercentage}
                    setRemovalPercentage={setRemovalPercentage}
                />
                <RemoveRangeInfo />
                <RemoveRangeButton />
            </div>
        </div>
    );
}
