import RangeStatus from '../../Global/RangeStatus/RangeStatus';
import styles from './HarvestPositionHeader.module.css';
// import { useAppDispatch } from '../../../utils/hooks/reduxToolkit';
// import { toggleDidUserFlipDenom } from '../../../utils/state/tradeDataSlice';
interface IHarvestPositionHeaderProps {
    isPositionInRange: boolean;
    isAmbient: boolean;
    baseTokenSymbol: string;
    quoteTokenSymbol: string;
    baseTokenLogoURI: string;
    quoteTokenLogoURI: string;
    isDenomBase: boolean;
}

export default function HarvestPositionHeader(props: IHarvestPositionHeaderProps) {
    const { baseTokenSymbol, quoteTokenSymbol } = props;
    // const dispatch = useAppDispatch();

    const isDenomBase = false;

    const isAmbient = false;

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
            <RangeStatus isInRange={props.isPositionInRange} isAmbient={isAmbient} />
        </div>
    );
}
