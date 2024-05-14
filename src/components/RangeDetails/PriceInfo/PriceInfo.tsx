import styles from './PriceInfo.module.css';

import Apy from '../../Global/Tabs/Apy/Apy';
import { useLocation } from 'react-router-dom';
import TokenIcon from '../../Global/TokenIcon/TokenIcon';
import {
    PositionIF,
    BlastRewardsDataIF,
    TokenIF,
} from '../../../ambient-utils/types';
import { useContext } from 'react';
import { TokenContext } from '../../../contexts/TokenContext';
import { ChainDataContext } from '../../../contexts/ChainDataContext';

interface propsIF {
    position: PositionIF;
    usdValue: string;
    lowRangeDisplay: string;
    highRangeDisplay: string;
    baseCollateralDisplay: string | undefined;
    quoteCollateralDisplay: string | undefined;
    baseFeesDisplay: string | undefined;
    quoteFeesDisplay: string | undefined;
    baseTokenLogoURI: string;
    quoteTokenLogoURI: string;
    baseTokenSymbol: string;
    quoteTokenSymbol: string;
    isAmbient: boolean;
    isDenomBase: boolean;
    positionApy: number | undefined;
    minRangeDenomByMoneyness: string;
    maxRangeDenomByMoneyness: string;
    baseTokenAddress: string;
    quoteTokenAddress: string;
    blastRewardsData: BlastRewardsDataIF;
    isBaseTokenMoneynessGreaterOrEqual: boolean;
    isAccountView: boolean;
    baseTokenCharacter: string;
    quoteTokenCharacter: string;
}

export default function PriceInfo(props: propsIF) {
    const {
        usdValue,
        lowRangeDisplay,
        highRangeDisplay,
        baseCollateralDisplay,
        quoteCollateralDisplay,
        baseFeesDisplay,
        quoteFeesDisplay,
        baseTokenLogoURI,
        quoteTokenLogoURI,
        baseTokenSymbol,
        quoteTokenSymbol,
        isAmbient,
        isDenomBase,
        positionApy,
        minRangeDenomByMoneyness,
        maxRangeDenomByMoneyness,
        baseTokenAddress,
        quoteTokenAddress,
        blastRewardsData,
        isBaseTokenMoneynessGreaterOrEqual,
        isAccountView,
        baseTokenCharacter,
        quoteTokenCharacter,
    } = props;

    const { pathname } = useLocation();
    // const { lastBlockNumber } = useContext(ChainDataContext);

    const isOnTradeRoute = pathname.includes('trade');
    const { tokens } = useContext(TokenContext);
    const { isActiveNetworkBlast } = useContext(ChainDataContext);

    const isDenomBaseLocal = isAccountView
        ? !isBaseTokenMoneynessGreaterOrEqual
        : isDenomBase;

    const baseToken: TokenIF | undefined =
        tokens.getTokenByAddress(baseTokenAddress);
    const quoteToken: TokenIF | undefined =
        tokens.getTokenByAddress(quoteTokenAddress);
    const baseTokenLogoDisplay = (
        <TokenIcon
            token={baseToken}
            src={baseTokenLogoURI}
            alt={baseTokenSymbol}
            size='s'
        />
    );
    const quoteTokenLogoDisplay = (
        <TokenIcon
            token={quoteToken}
            src={quoteTokenLogoURI}
            alt={quoteTokenSymbol}
            size='s'
        />
    );
    // const unknownTokenLogoDisplay = (
    //     <TokenIcon
    //         token={undefined}
    //         src={undefined}
    //         alt={undefined}
    //         size='xs'
    //     />
    // );

    const totalValue = (
        <div className={styles.value_content}>
            <p>Total Value:</p>
            <p>{usdValue}</p>
        </div>
    );

    const earnedContent = isAmbient ? (
        <div className={styles.ambi_info_text}>
            Ambient position rewards are compounded back into the original
            position and are included in the amounts above.
        </div>
    ) : (
        <section>
            <div>
                <p>{`Earned ${baseTokenSymbol}`}</p>
                <p>
                    {baseFeesDisplay === undefined ? '…' : baseFeesDisplay}
                    {baseTokenLogoDisplay}
                </p>
            </div>

            <div>
                <p>{`Earned ${quoteTokenSymbol}`}</p>
                <p>
                    {quoteFeesDisplay === undefined ? '…' : quoteFeesDisplay}
                    {quoteTokenLogoDisplay}
                </p>
            </div>
        </section>
    );

    const priceStatusContent = (
        <div className={styles.price_status_content}>
            <section>
                <p>Range Min:</p>
                <h2 className={styles.low_range}>
                    {isAmbient
                        ? '0'
                        : isOnTradeRoute
                        ? (isDenomBaseLocal
                              ? quoteTokenCharacter
                              : baseTokenCharacter) + lowRangeDisplay
                        : (isDenomBaseLocal
                              ? quoteTokenCharacter
                              : baseTokenCharacter) + minRangeDenomByMoneyness}
                </h2>
            </section>

            <section>
                <p>Range Max:</p>
                <h2 className={styles.high_range}>
                    {isAmbient
                        ? '∞'
                        : isOnTradeRoute
                        ? (isDenomBaseLocal
                              ? quoteTokenCharacter
                              : baseTokenCharacter) + highRangeDisplay
                        : (isDenomBaseLocal
                              ? quoteTokenCharacter
                              : baseTokenCharacter) + maxRangeDenomByMoneyness}
                </h2>
            </section>
        </div>
    );

    const baseTokenLargeDisplay = (
        <TokenIcon
            token={baseToken}
            src={baseTokenLogoURI}
            alt={baseTokenSymbol}
            size='2xl'
        />
    );

    const quoteTokenLargeDisplay = (
        <TokenIcon
            token={quoteToken}
            src={quoteTokenLogoURI}
            alt={quoteTokenSymbol}
            size='2xl'
        />
    );

    const tokenPairDetails = (
        <div className={styles.token_pair_details}>
            <div className={styles.token_pair_images}>
                {isDenomBaseLocal
                    ? baseTokenLargeDisplay
                    : quoteTokenLargeDisplay}
                {isDenomBaseLocal
                    ? quoteTokenLargeDisplay
                    : baseTokenLargeDisplay}
            </div>
            <p>
                {isDenomBaseLocal ? baseTokenSymbol : quoteTokenSymbol} /{' '}
                {isDenomBaseLocal ? quoteTokenSymbol : baseTokenSymbol}
            </p>
        </div>
    );

    const showEarnedRewards = isActiveNetworkBlast;

    const rewardsContent = (
        <section>
            <span className={styles.divider} />
            <div>Rewards:</div>
            <BlastRewardRow
                key={'BLAST points'}
                rewardType={'BLAST points'}
                reward={blastRewardsData.points}
                logo={blastLogo}
            />
            <BlastRewardRow
                key={'BLAST gold'}
                rewardType={'BLAST gold'}
                reward={blastRewardsData.gold}
                logo={blastLogo}
            />
            {/* {Object.entries(blastPointsData).map(([rewardType, reward]) => {
                const logo =
                    rewardType === 'BLAST points' ||
                    rewardType === 'BLAST' ||
                    rewardType === 'BLAST gold'
                        ? blastLogo
                        : rewardType === 'AMBI points' || rewardType === 'AMBI'
                        ? ambiLogo
                        : rewardType === '__BASE__'
                        ? baseTokenLogoDisplay
                        : rewardType === '__QUOTE__'
                        ? quoteTokenLogoDisplay
                        : rewardType === 'TOKEN yield'
                        ? unknownTokenLogoDisplay
                        : ambiLogo;
                return (
                    <BlastRewardRow
                        key={rewardType}
                        rewardType={rewardType}
                        reward={reward}
                        logo={logo}
                    />
                );
            })} */}
        </section>
    );

    return (
        <div className={styles.main_container}>
            <div className={styles.price_info_container}>
                {tokenPairDetails}
                {totalValue}
                <div className={styles.earned_container}>
                    <section>
                        <div>
                            <p>{`Pooled ${baseTokenSymbol}`}</p>
                            <p>
                                {baseCollateralDisplay === undefined
                                    ? '…'
                                    : baseCollateralDisplay}
                                {baseTokenLogoDisplay}
                            </p>
                        </div>

                        <div>
                            <p>{`Pooled ${quoteTokenSymbol}`}</p>
                            <p>
                                {quoteCollateralDisplay === undefined
                                    ? '…'
                                    : quoteCollateralDisplay}
                                {quoteTokenLogoDisplay}
                            </p>
                        </div>
                    </section>
                    <span className={styles.divider} />

                    {earnedContent}

                    {showEarnedRewards && rewardsContent}
                </div>

                {priceStatusContent}
                {positionApy !== 0 ? (
                    <Apy
                        amount={positionApy}
                        fs='48px'
                        lh='60px'
                        center
                        showTitle
                    />
                ) : undefined}
            </div>
        </div>
    );
}

const BlastRewardRow = (props: {
    rewardType: string;
    reward: string;
    logo: JSX.Element | undefined;
}) => {
    const { rewardType, reward, logo } = props;
    return (
        <div>
            <p>{rewardType}</p>
            <p>
                {reward}
                {logo}
            </p>
        </div>
    );
};

export const blastLogo = (
    <svg
        xmlns='http://www.w3.org/2000/svg'
        width='15'
        height='15'
        viewBox='0 0 20 14'
        fill='none'
    >
        <path
            d='M15.7589 6.99084L18.9128 5.41927L20 2.08235L17.8256 0.5H3.34769L0 2.98654H17.0183L16.1141 5.78525H9.28956L8.63294 7.83045H15.4575L13.5414 13.7185L16.7384 12.1362L17.8794 8.60548L15.7374 7.0339L15.7589 6.99084Z'
            fill='#FCFC03'
        />
        <path
            d='M4.81162 11.1889L6.78148 5.05331L4.59633 3.41714L1.31323 13.7185H13.5414L14.3595 11.1889H4.81162Z'
            fill='#FCFC03'
        />
    </svg>
);

export const ambiLogo = (
    <svg
        xmlns='http://www.w3.org/2000/svg'
        width='15'
        height='15'
        viewBox='0 0 14 12'
        fill='none'
    >
        <path
            d='M9.59792 4.99692C9.59792 6.4865 8.43012 7.69404 6.98957 7.69404C5.54902 7.69404 4.38123 6.4865 4.38123 4.99692C4.38123 6.39412 5.54902 7.52678 6.98957 7.52678C8.43012 7.52678 9.59792 6.39412 9.59792 4.99692Z'
            fill='#7371FC'
            stroke='#7371FC'
            strokeWidth='0.272212'
        />
        <path
            d='M10.1405 4.99691C10.1405 6.78672 8.72981 8.23764 6.98963 8.23764C5.24944 8.23764 3.83875 6.78672 3.83875 4.99691C3.83875 4.64205 3.91927 4.30096 4.02767 3.98288C3.91927 4.30096 3.88048 4.64205 3.88048 4.99691C3.88048 6.69434 5.27249 8.03403 6.98963 8.03403C8.70676 8.03403 10.0988 6.69434 10.0988 4.99691C10.0988 4.64339 10.0621 4.30353 9.95448 3.98648C10.0621 4.30353 10.1405 4.64339 10.1405 4.99691Z'
            fill='#7371FC'
            stroke='#7371FC'
            strokeWidth='0.272212'
        />
        <path
            d='M10.2601 3.1436C10.5697 3.69068 10.7664 4.32311 10.7664 4.99689C10.7664 7.12157 9.07545 8.84395 6.98953 8.84395C4.90362 8.84395 3.21265 7.12156 3.21265 4.99689C3.21265 4.32197 3.41166 3.68855 3.72216 3.14084C3.41166 3.68855 3.25438 4.32197 3.25438 4.99689C3.25438 7.01764 4.92666 8.59852 6.98953 8.59852C9.0524 8.59852 10.7247 7.01764 10.7247 4.99689C10.7247 4.32311 10.5697 3.69068 10.2601 3.1436Z'
            fill='#7371FC'
            stroke='#7371FC'
            strokeWidth='0.272212'
        />
        <path
            d='M11.5176 4.99688C11.5176 7.56034 9.49031 9.63844 6.98952 9.63844C4.48872 9.63844 2.46143 7.56034 2.46143 4.99688C2.46143 3.96923 2.8257 3.02174 3.40266 2.26282C2.8257 3.02174 2.50316 3.96923 2.50316 4.99688C2.50316 7.42178 4.51177 9.34074 6.98952 9.34074C9.46726 9.34074 11.4759 7.42178 11.4759 4.99688C11.4759 3.97005 11.1556 3.02326 10.5794 2.26465C11.1556 3.02326 11.5176 3.97005 11.5176 4.99688Z'
            fill='#7371FC'
            stroke='#7371FC'
            strokeWidth='0.272212'
        />
        <path
            d='M12.3732 4.99689C12.3732 7.91832 9.96286 10.2084 6.98956 10.2084C4.01627 10.2084 1.60594 7.91832 1.60594 4.99689C1.60594 2.99206 2.66823 1.24149 4.28343 0.304089C2.66823 1.24149 1.54333 2.99206 1.54333 4.99689C1.54333 8.06843 3.98169 10.5584 6.98956 10.5584C9.99743 10.5584 12.4358 8.06843 12.4358 4.99689C12.4358 2.98776 11.3079 1.23398 9.68695 0.298065C11.3079 1.23398 12.3732 2.98776 12.3732 4.99689Z'
            fill='#7371FC'
            stroke='#7371FC'
            strokeWidth='0.272212'
        />
        <path
            d='M13.4791 4.99689C13.4791 8.50722 10.5737 11.1388 6.98957 11.1388C3.40548 11.1388 0.5 8.50722 0.5 4.99689C0.5 8.66888 3.40548 11.5047 6.98957 11.5047C10.5737 11.5047 13.4791 8.66888 13.4791 4.99689Z'
            fill='#7371FC'
            stroke='#7371FC'
            strokeWidth='0.272212'
        />
    </svg>
);
