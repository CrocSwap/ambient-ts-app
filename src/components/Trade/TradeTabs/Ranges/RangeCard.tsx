import styles from './RangeCard.module.css';
import TokenQty from '../../../Global/Tabs/TokenQty/TokenQty';
import WalletAndId from '../../../Global/Tabs/WalletAndID/WalletAndId';
import RangeStatus from '../../../Global/RangeStatus/RangeStatus';
import RangeMinMax from '../../../Global/Tabs/RangeMinMax/RangeMinMax';
import Apy from '../../../Global/Tabs/Apy/Apy';
import { PositionIF } from '../../../../utils/interfaces/PositionIF';
import { ambientPosSlot, ChainSpec, concPosSlot, CrocEnv } from '@crocswap-libs/sdk';
import RangesMenu from '../../../Global/Tabs/TableMenu/TableMenuComponents/RangesMenu';
import { ethers } from 'ethers';
import { useEffect, Dispatch, SetStateAction } from 'react';
// import { formatAmountOld } from '../../../../utils/numbers';
import getUnicodeCharacter from '../../../../utils/functions/getUnicodeCharacter';
import Value from '../../../Global/Tabs/Value/Value';
import { formatAmountOld } from '../../../../utils/numbers';

interface RangeCardProps {
    isUserLoggedIn: boolean | undefined;
    crocEnv: CrocEnv | undefined;
    chainData: ChainSpec;
    provider: ethers.providers.Provider | undefined;
    chainId: string;
    portfolio?: boolean;
    baseTokenBalance: string;
    quoteTokenBalance: string;
    baseTokenDexBalance: string;
    quoteTokenDexBalance: string;
    notOnTradeRoute?: boolean;
    position: PositionIF;
    isAllPositionsEnabled: boolean;
    tokenAAddress: string;
    tokenBAddress: string;
    isAuthenticated: boolean;
    account?: string;
    isDenomBase: boolean;
    lastBlockNumber: number;
    currentPositionActive: string;
    setCurrentPositionActive: Dispatch<SetStateAction<string>>;
    openGlobalModal: (content: React.ReactNode) => void;
    closeGlobalModal: () => void;
}

export default function RangeCard(props: RangeCardProps) {
    const {
        // isUserLoggedIn,
        crocEnv,
        chainData,
        provider,
        chainId,
        position,
        // isAllPositionsEnabled,
        // tokenAAddress,
        // tokenBAddress,
        baseTokenBalance,
        quoteTokenBalance,
        baseTokenDexBalance,
        quoteTokenDexBalance,
        // account,
        // notOnTradeRoute,
        // isAuthenticated,
        account,
        lastBlockNumber,
        currentPositionActive,
        setCurrentPositionActive,
    } = props;

    // -------------------------------POSITION HASH------------------------

    let posHash;
    if (position.positionType == 'ambient') {
        posHash = ambientPosSlot(position.user, position.base, position.quote, 36000);
    } else {
        posHash = concPosSlot(
            position.user,
            position.base,
            position.quote,
            position.bidTick,
            position.askTick,
            36000,
        );
    }

    // -------------------------------END OF POSITION HASH------------------------

    // -----------------------------POSITIONS RANGE--------------------
    const isPositionInRange = position.isPositionInRange;

    // ----------------------------------END OF POSITIONS RANGE-------------------

    // --------------------SELECTED TOKEN FUNCTIONALITY---------------------------
    // const ownerId = position ? position.user : null;

    // const positionBaseAddressLowerCase = position.base.toLowerCase();
    // const positionQuoteAddressLowerCase = position.quote.toLowerCase();

    // const tokenAAddressLowerCase = tokenAAddress.toLowerCase();
    // const tokenBAddressLowerCase = tokenBAddress.toLowerCase();

    // const positionMatchesSelectedTokens =
    //     (positionBaseAddressLowerCase === tokenAAddressLowerCase ||
    //         positionQuoteAddressLowerCase === tokenAAddressLowerCase) &&
    //     (positionBaseAddressLowerCase === tokenBAddressLowerCase ||
    //         positionQuoteAddressLowerCase === tokenBAddressLowerCase);

    const accountAddress = account ? account.toLowerCase() : null;
    const userMatchesConnectedAccount = accountAddress === position.user.toLowerCase();

    // const positionOwnedByConnectedAccount = ownerId === accountAddress;

    // -------------------- ENDSELECTED TOKEN FUNCTIONALITY---------------------------

    // ---------------------------------POSITIONS MIN AND MAX RANGE--------------------

    const baseTokenCharacter = position.baseSymbol ? getUnicodeCharacter(position.baseSymbol) : '';
    const quoteTokenCharacter = position.quoteSymbol
        ? getUnicodeCharacter(position.quoteSymbol)
        : '';

    const minRange = props.isDenomBase
        ? quoteTokenCharacter + position.lowRangeDisplayInBase
        : baseTokenCharacter + position.lowRangeDisplayInQuote;
    const maxRange = props.isDenomBase
        ? quoteTokenCharacter + position.highRangeDisplayInBase
        : baseTokenCharacter + position.highRangeDisplayInQuote;

    const ambientMinOrNull = position.positionType === 'ambient' ? '0' : minRange;
    const ambientMaxOrNull = position.positionType === 'ambient' ? '∞' : maxRange;

    // ---------------------------------END OF POSITIONS MIN AND MAX RANGE--------------------

    // --------------------------REMOVE RANGE PROPS-------------------------------
    const rangeDetailsProps = {
        crocEnv: crocEnv,
        provider: provider,
        chainData: chainData,
        chainId: chainId,
        poolIdx: position.poolIdx,
        isPositionInRange: isPositionInRange,
        isAmbient: position.positionType === 'ambient',
        user: position.user,
        bidTick: position.bidTick,
        askTick: position.askTick,
        baseTokenSymbol: position.baseSymbol,
        baseTokenDecimals: position.baseDecimals,
        quoteTokenSymbol: position.quoteSymbol,
        quoteTokenDecimals: position.quoteDecimals,
        baseTokenBalance: baseTokenBalance,
        quoteTokenBalance: quoteTokenBalance,
        baseTokenDexBalance: baseTokenDexBalance,
        quoteTokenDexBalance: quoteTokenDexBalance,
        lowRangeDisplay: ambientMinOrNull,
        highRangeDisplay: ambientMaxOrNull,
        baseTokenLogoURI: position.baseTokenLogoURI,
        quoteTokenLogoURI: position.quoteTokenLogoURI,
        isDenomBase: props.isDenomBase,
        baseTokenAddress: props.position.base,
        quoteTokenAddress: props.position.quote,
        lastBlockNumber: lastBlockNumber,
        positionApy: position.apy,

        closeGlobalModal: props.closeGlobalModal,
        openGlobalModal: props.openGlobalModal,
    };

    const positionDomId =
        position.positionStorageSlot === currentPositionActive
            ? `position-${position.positionStorageSlot}`
            : '';

    // console.log(rangeDetailsProps.lastBlockNumber);

    function scrollToDiv() {
        const element = document.getElementById(positionDomId);
        element?.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'nearest' });
    }

    useEffect(() => {
        position.positionStorageSlot === currentPositionActive ? scrollToDiv() : null;
    }, [currentPositionActive]);

    const activePositionStyle =
        position.positionStorageSlot === currentPositionActive ? styles.active_position_style : '';

    // if (!positionMatchesSelectedTokens) return null;

    const usdValueNum = position.totalValueUSD;

    const usdValueTruncated = !usdValueNum
        ? undefined
        : usdValueNum < 0.0001
        ? usdValueNum.toExponential(2)
        : usdValueNum < 2
        ? usdValueNum.toPrecision(3)
        : usdValueNum >= 10000
        ? formatAmountOld(usdValueNum, 1)
        : // ? baseLiqDisplayNum.toExponential(2)
          usdValueNum.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
          });

    return (
        // <li
        //     className={`${styles.main_container} ${activePositionStyle}`}
        //     onClick={() =>
        //         position.positionStorageSlot === currentPositionActive
        //             ? null
        //             : setCurrentPositionActive('')
        //     }
        //     id={positionDomId}
        // >
        //     <div className={styles.row_container}>
        //         {/* ------------------------------------------------------ */}

        //         <WalletAndId
        //             ownerId={position.user}
        //             posHash={posHash as string}
        //             ensName={position.ensResolution ? position.ensResolution : null}
        //             isOwnerActiveAccount={userMatchesConnectedAccount}
        //         />

        //         {/* ------------------------------------------------------ */}
        //         <RangeMinMax min={ambientMinOrNull} max={ambientMaxOrNull} />
        //         {/* ------------------------------------------------------ */}
        //         {/* ------------------------------------------------------ */}
        //         <Value usdValue={usdValueTruncated ? '$' + usdValueTruncated : '…'} />
        //         {/* ------------------------------------------------------ */}

        //         <TokenQty
        //             baseQty={position.positionLiqBaseTruncated}
        //             quoteQty={position.positionLiqQuoteTruncated}
        //             baseTokenCharacter={baseTokenCharacter}
        //             quoteTokenCharacter={quoteTokenCharacter}
        //         />
        //         {/* ------------------------------------------------------ */}
        //         <Apy amount={position.apy ?? undefined} />
        //         {/* ------------------------------------------------------ */}
        //         <RangeStatus
        //             isInRange={isPositionInRange}
        //             isAmbient={position.positionType === 'ambient'}
        //         />
        //     </div>

        //     <div className={styles.menu_container}>
        //         <RangesMenu
        //             crocEnv={crocEnv}
        //             chainData={chainData}
        //             userMatchesConnectedAccount={userMatchesConnectedAccount}
        //             rangeDetailsProps={rangeDetailsProps}
        //             posHash={posHash as string}
        //             positionData={position}
        //             baseTokenBalance={baseTokenBalance}
        //             quoteTokenBalance={quoteTokenBalance}
        //             baseTokenDexBalance={baseTokenDexBalance}
        //             quoteTokenDexBalance={quoteTokenDexBalance}

        //         />
        //     </div>
        // </li>
        <p>
            This file has been refactored and updated to RangeRow.tsx on 10/14/2022. It is no longer
            in use. If not uncommented by 12/14/2022, it can be safely deleted, along with
            RangeCard.module.css. -Jr
        </p>
    );
}
