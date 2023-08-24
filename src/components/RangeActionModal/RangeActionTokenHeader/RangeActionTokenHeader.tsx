import { SetStateAction, useContext } from 'react';
import RangeStatus from '../../Global/RangeStatus/RangeStatus';
import TokenIcon from '../../Global/TokenIcon/TokenIcon';
import styles from './RangeActionTokenHeader.module.css';
import { TokenContext } from '../../../contexts/TokenContext';
import { TokenIF } from '../../../utils/interfaces/exports';

interface propsIF {
    isPositionInRange: boolean;
    isAmbient: boolean;
    baseTokenSymbol: string;
    quoteTokenSymbol: string;
    baseTokenLogoURI: string;
    quoteTokenLogoURI: string;
    setShowSettings: (value: SetStateAction<boolean>) => void;
    showSettings: boolean;
    baseTokenAddress: string;
    quoteTokenAddress: string;
}

export default function RangeActionTokenHeader(props: propsIF) {
    const {
        isPositionInRange,
        baseTokenAddress,
        quoteTokenAddress,
        baseTokenLogoURI,
        quoteTokenLogoURI,
        baseTokenSymbol,
        quoteTokenSymbol,
        isAmbient,
    } = props;
    const { showSettings, setShowSettings } = props;
    const settingsSvg = (
        <svg
            width='16'
            height='16'
            viewBox='0 0 14 14'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
            className={styles.hoverable_icon}
        >
            <rect
                y='9.625'
                width='8.75'
                height='1.75'
                rx='0.875'
                fill=''
            ></rect>
            <rect
                x='5.25'
                y='2.625'
                width='8.75'
                height='1.75'
                rx='0.875'
                fill=''
            ></rect>
            <circle cx='12.25' cy='10.5' r='1.75' fill=''></circle>
            <circle cx='1.75' cy='3.5' r='1.75' fill=''></circle>
        </svg>
    );

    const { tokens } = useContext(TokenContext);
    const baseToken: TokenIF | undefined =
        tokens.getTokenByAddress(baseTokenAddress);
    const quoteToken: TokenIF | undefined =
        tokens.getTokenByAddress(quoteTokenAddress);

    return (
        <div className={styles.container}>
            <div className={styles.token_info}>
                <TokenIcon
                    token={baseToken}
                    src={baseTokenLogoURI}
                    alt={baseTokenSymbol}
                    size='2xl'
                />
                <TokenIcon
                    token={quoteToken}
                    src={quoteTokenLogoURI}
                    alt={quoteTokenSymbol}
                    size='2xl'
                />
                <span>
                    {baseTokenSymbol} /{quoteTokenSymbol}
                </span>
            </div>

            <section
                style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: '4px',
                }}
            >
                <RangeStatus
                    isInRange={isPositionInRange}
                    isEmpty={false}
                    isAmbient={isAmbient}
                    size='s'
                />
                <div
                    onClick={() => setShowSettings(!showSettings)}
                    className={styles.settings_icon}
                >
                    {showSettings ? null : settingsSvg}
                </div>
            </section>
        </div>
    );
}
