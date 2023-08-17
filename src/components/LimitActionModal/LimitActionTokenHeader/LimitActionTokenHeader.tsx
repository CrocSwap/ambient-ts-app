import { useContext } from 'react';
import { TokenContext } from '../../../contexts/TokenContext';
import { useAppDispatch } from '../../../utils/hooks/reduxToolkit';
import { toggleDidUserFlipDenom } from '../../../utils/state/tradeDataSlice';
import OpenOrderStatus from '../../Global/OpenOrderStatus/OpenOrderStatus';
import TokenIcon from '../../Global/TokenIcon/TokenIcon';
import styles from './LimitActionTokenHeader.module.css';
import { TokenIF } from '../../../utils/interfaces/exports';

interface propsIF {
    isOrderFilled: boolean;
    baseTokenSymbol: string;
    quoteTokenSymbol: string;
    baseTokenLogoURI: string;
    quoteTokenLogoURI: string;
    isDenomBase: boolean;
    baseTokenAddress: string;
    quoteTokenAddress: string;
}

export default function LimitActionTokenHeader(props: propsIF) {
    const {
        isOrderFilled,
        baseTokenSymbol,
        quoteTokenSymbol,
        baseTokenLogoURI,
        quoteTokenLogoURI,
        isDenomBase,
        baseTokenAddress,
        quoteTokenAddress,
    } = props;
    const dispatch = useAppDispatch();
    const { tokens } = useContext(TokenContext);
    const baseToken: TokenIF | undefined =
        tokens.getTokenByAddress(baseTokenAddress);
    const quoteToken: TokenIF | undefined =
        tokens.getTokenByAddress(quoteTokenAddress);

    return (
        <div className={styles.container}>
            <div
                className={styles.token_info}
                onClick={() => {
                    dispatch(toggleDidUserFlipDenom());
                }}
            >
                <TokenIcon
                    token={isDenomBase ? baseToken : quoteToken}
                    src={isDenomBase ? baseTokenLogoURI : quoteTokenLogoURI}
                    alt={quoteTokenSymbol}
                    size='2xl'
                />
                <TokenIcon
                    token={isDenomBase ? quoteToken : baseToken}
                    src={isDenomBase ? quoteTokenLogoURI : baseTokenLogoURI}
                    alt={baseTokenSymbol}
                    size='2xl'
                />
                <span>
                    {isDenomBase ? baseTokenSymbol : quoteTokenSymbol} /
                    {isDenomBase ? quoteTokenSymbol : baseTokenSymbol}
                </span>
            </div>
            <OpenOrderStatus isFilled={isOrderFilled} />
        </div>
    );
}
