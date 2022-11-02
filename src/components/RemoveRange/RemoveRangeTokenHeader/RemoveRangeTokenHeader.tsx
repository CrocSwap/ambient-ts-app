import NoTokenIcon from '../../Global/NoTokenIcon/NoTokenIcon';
import RangeStatus from '../../Global/RangeStatus/RangeStatus';
import styles from './RemoveRangeTokenHeader.module.css';
// import { useAppDispatch } from '../../../utils/hooks/reduxToolkit';
// import { toggleDidUserFlipDenom } from '../../../utils/state/tradeDataSlice';
interface IRemoveRangeTokenHeaderProps {
    isPositionInRange: boolean;
    isAmbient: boolean;
    baseTokenSymbol: string;
    quoteTokenSymbol: string;
    baseTokenLogoURI: string;
    quoteTokenLogoURI: string;
    isDenomBase: boolean;
}

export default function RemoveRangeTokenHeader(props: IRemoveRangeTokenHeaderProps) {
    // const dispatch = useAppDispatch();

    return (
        <div className={styles.container}>
            <div
                className={styles.token_info}
                // onClick={() => {
                //     dispatch(toggleDidUserFlipDenom());
                // }}
            >
                {props.baseTokenLogoURI ? (
                    <img src={props.baseTokenLogoURI} alt={props.baseTokenSymbol} />
                ) : (
                    <NoTokenIcon tokenInitial={props.baseTokenSymbol.charAt(0)} width='30px' />
                )}
                {props.quoteTokenLogoURI ? (
                    <img src={props.quoteTokenLogoURI} alt={props.quoteTokenSymbol} />
                ) : (
                    <NoTokenIcon tokenInitial={props.quoteTokenSymbol.charAt(0)} width='30px' />
                )}

                {/* <img src={props.quoteTokenLogoURI} alt='' /> */}
                {/* <img src='https://cryptologos.cc/logos/usd-coin-usdc-logo.png' alt='' /> */}
                <span>
                    {props.baseTokenSymbol} /{props.quoteTokenSymbol}
                </span>
            </div>
            <RangeStatus isInRange={props.isPositionInRange} isAmbient={props.isAmbient} />
        </div>
    );
}
