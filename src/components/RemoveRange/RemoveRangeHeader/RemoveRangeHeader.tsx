import RangeStatus from '../../Global/RangeStatus/RangeStatus';
import styles from './RemoveRangeHeader.module.css';

interface IRemoveRangeHeaderProps {
    isPositionInRange: boolean;
    isAmbient: boolean;
    baseTokenSymbol: string;
    quoteTokenSymbol: string;
}

export default function RemoveRangeHeader(props: IRemoveRangeHeaderProps) {
    return (
        <div className={styles.container}>
            <div className={styles.token_info}>
                <img
                    src='https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Ethereum-icon-purple.svg/480px-Ethereum-icon-purple.svg.png'
                    alt=''
                />
                <img src='https://cryptologos.cc/logos/usd-coin-usdc-logo.png' alt='' />
                <span>
                    {props.baseTokenSymbol} / {props.quoteTokenSymbol}
                </span>
            </div>
            <RangeStatus isInRange={props.isPositionInRange} isAmbient={props.isAmbient} />
        </div>
    );
}
