import styles from './ClaimOrderTokenHeader.module.css';
import { useAppDispatch } from '../../../utils/hooks/reduxToolkit';
import { toggleDidUserFlipDenom } from '../../../utils/state/tradeDataSlice';
import OpenOrderStatus from '../../Global/OpenOrderStatus/OpenOrderStatus';
interface IClaimOrderTokenHeaderProps {
    isOrderFilled: boolean;
    baseTokenSymbol: string;
    quoteTokenSymbol: string;
    baseTokenLogoURI: string;
    quoteTokenLogoURI: string;
    isDenomBase: boolean;
}

export default function ClaimOrderTokenHeader(
    props: IClaimOrderTokenHeaderProps,
) {
    const dispatch = useAppDispatch();

    return (
        <div className={styles.container}>
            <div
                className={styles.token_info}
                onClick={() => {
                    dispatch(toggleDidUserFlipDenom());
                }}
            >
                <img
                    src={
                        props.isDenomBase
                            ? props.baseTokenLogoURI
                            : props.quoteTokenLogoURI
                    }
                    alt=''
                />
                <img
                    src={
                        props.isDenomBase
                            ? props.quoteTokenLogoURI
                            : props.baseTokenLogoURI
                    }
                    alt=''
                />
                <span>
                    {props.isDenomBase
                        ? props.baseTokenSymbol
                        : props.quoteTokenSymbol}{' '}
                    /
                    {props.isDenomBase
                        ? props.quoteTokenSymbol
                        : props.baseTokenSymbol}
                </span>
            </div>
            <OpenOrderStatus isFilled={props.isOrderFilled} />
        </div>
    );
}
