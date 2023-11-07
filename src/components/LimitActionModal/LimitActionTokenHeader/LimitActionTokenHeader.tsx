import { useContext } from 'react';
import { TokenContext } from '../../../contexts/TokenContext';
import { useAppDispatch } from '../../../utils/hooks/reduxToolkit';
import { toggleDidUserFlipDenom } from '../../../utils/state/tradeDataSlice';
import OpenOrderStatus from '../../Global/OpenOrderStatus/OpenOrderStatus';
import TokenIcon from '../../Global/TokenIcon/TokenIcon';
import styles from './LimitActionTokenHeader.module.css';
import { TokenIF } from '../../../utils/interfaces/exports';
import uriToHttp from '../../../utils/functions/uriToHttp';

interface propsIF {
    isOrderFilled: boolean;
    isLimitOrderPartiallyFilled: boolean;
    fillPercentage: number;
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
        baseTokenAddress,
        quoteTokenAddress,
        isLimitOrderPartiallyFilled,
        fillPercentage,
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
                    token={baseToken}
                    src={uriToHttp(baseTokenLogoURI)}
                    alt={baseTokenSymbol}
                    size='2xl'
                />
                <TokenIcon
                    token={quoteToken}
                    src={uriToHttp(quoteTokenLogoURI)}
                    alt={quoteTokenSymbol}
                    size='2xl'
                />
                <span>
                    {baseTokenSymbol} /{quoteTokenSymbol}
                </span>
            </div>
            <OpenOrderStatus
                isFilled={isOrderFilled}
                isLimitOrderPartiallyFilled={isLimitOrderPartiallyFilled}
                fillPercentage={fillPercentage}
            />
        </div>
    );
}
