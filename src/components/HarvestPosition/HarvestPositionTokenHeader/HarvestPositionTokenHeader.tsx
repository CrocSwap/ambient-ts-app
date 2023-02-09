import RangeStatus from '../../Global/RangeStatus/RangeStatus';
import styles from './HarvestPositionTokenHeader.module.css';
// import { useAppDispatch } from '../../../utils/hooks/reduxToolkit';
// import { toggleDidUserFlipDenom } from '../../../utils/state/tradeDataSlice';
interface propsIF {
    isPositionInRange: boolean;
    isAmbient: boolean;
    baseTokenSymbol: string;
    quoteTokenSymbol: string;
    baseTokenLogoURI: string;
    quoteTokenLogoURI: string;
    isDenomBase: boolean;
}

export default function HarvestPositionTokenHeader(props: propsIF) {
    const { baseTokenSymbol, quoteTokenSymbol } = props;
    // const dispatch = useAppDispatch();

    const isDenomBase = false;

    return (
        <div className={styles.container}>
            <div
                className={styles.token_info}
                // onClick={() => {
                //     dispatch(toggleDidUserFlipDenom());
                // }}
            >
                <img
                    src={props.isDenomBase ? props.baseTokenLogoURI : props.quoteTokenLogoURI}
                    alt=''
                />
                <img
                    src={props.isDenomBase ? props.quoteTokenLogoURI : props.baseTokenLogoURI}
                    alt=''
                />
                <span>
                    {isDenomBase ? quoteTokenSymbol : baseTokenSymbol} /{' '}
                    {isDenomBase ? baseTokenSymbol : quoteTokenSymbol}
                </span>
            </div>
            <RangeStatus isInRange={props.isPositionInRange} isEmpty={false} isAmbient={false} />
        </div>
    );
}
