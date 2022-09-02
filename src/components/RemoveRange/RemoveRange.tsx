import styles from './RemoveRange.module.css';
import RemoveRangeWidth from './RemoveRangeWidth/RemoveRangeWidth';
import RemoveRangeHeader from './RemoveRangeHeader/RemoveRangeHeader';
import RemoveRangeInfo from './RemoveRangeInfo/RemoveRangInfo';
import RemoveRangeButton from './RemoveRangeButton/RemoveRangeButton';
import { useEffect, useState } from 'react';
// import RemoveRangeSettings from './RemoveRangeSettings/RemoveRangeSettings';
import { RiListSettingsLine } from 'react-icons/ri';
import { PositionIF } from '../../utils/interfaces/PositionIF';
import { ethers } from 'ethers';
import { CrocEnv } from '@crocswap-libs/sdk';
interface IRemoveRangeProps {
    provider: ethers.providers.Provider;
    chainId: string;
    poolIdx: number;
    user: string;
    bidTick: number;
    askTick: number;
    baseTokenAddress: string;
    quoteTokenAddress: string;
    isPositionInRange: boolean;
    isAmbient: boolean;
    baseTokenSymbol: string;
    quoteTokenSymbol: string;
    baseTokenLogoURI: string;
    quoteTokenLogoURI: string;
    isDenomBase: boolean;
    lastBlockNumber: number;
    position: PositionIF;
}

export default function RemoveRange(props: IRemoveRangeProps) {
    const {
        // chainId,
        // poolIdx,
        // user,
        // bidTick,
        // askTick,
        // baseTokenAddress,
        // quoteTokenAddress,
        provider,
        lastBlockNumber,
        position,
    } = props;

    const [removalPercentage, setRemovalPercentage] = useState(100);
    const [posLiqBaseDecimalCorrected, setPosLiqBaseDecimalCorrected] = useState<
        number | undefined
    >();
    const [posLiqQuoteDecimalCorrected, setPosLiqQuoteDecimalCorrected] = useState<
        number | undefined
    >();
    const [feeLiqBaseDecimalCorrected, setFeeLiqBaseDecimalCorrected] = useState<
        number | undefined
    >();
    const [feeLiqQuoteDecimalCorrected, setFeeLiqQuoteDecimalCorrected] = useState<
        number | undefined
    >();

    const positionStatsCacheEndpoint = 'https://809821320828123.de:5000/position_stats?';

    useEffect(() => {
        if (
            position.chainId &&
            position.poolIdx &&
            position.user &&
            position.base &&
            position.quote &&
            position.positionType
        ) {
            (async () => {
                fetch(
                    positionStatsCacheEndpoint +
                        new URLSearchParams({
                            chainId: position.chainId,
                            user: position.user,
                            base: position.base,
                            quote: position.quote,
                            poolIdx: position.poolIdx.toString(),
                            bidTick: position.bidTick ? position.bidTick.toString() : '0',
                            askTick: position.askTick ? position.askTick.toString() : '0',
                            calcValues: 'true',
                            positionType: position.positionType,
                        }),
                )
                    .then((response) => response.json())
                    .then((json) => {
                        setPosLiqBaseDecimalCorrected(json?.data?.positionLiqBaseDecimalCorrected);
                        setPosLiqQuoteDecimalCorrected(
                            json?.data?.positionLiqQuoteDecimalCorrected,
                        );
                        setFeeLiqBaseDecimalCorrected(json?.data?.feesLiqBaseDecimalCorrected);
                        setFeeLiqQuoteDecimalCorrected(json?.data?.feesLiqQuoteDecimalCorrected);
                    });
            })();
        }
    }, [lastBlockNumber]);

    const [showSettings, setShowSettings] = useState(false);

    const removeRangeSetttingIcon = (
        <div onClick={() => setShowSettings(!showSettings)} className={styles.settings_icon}>
            {showSettings ? null : <RiListSettingsLine size={20} />}
        </div>
    );

    // const [newRemovalTransactionHash, setNewRemovalTransactionHash] = useState('');
    // const [txErrorCode, setTxErrorCode] = useState(0);
    // const [txErrorMessage, setTxErrorMessage] = useState('');

    const liquiditySlippageTolerance = 1;

    const removeFn = async () => {
        console.log(`${removalPercentage}% to be removed.`);

        const env = new CrocEnv(provider);
        const pool = env.pool(position.base, position.quote);
        const spotPrice = await pool.displayPrice();

        const lowLimit = spotPrice * (1 - liquiditySlippageTolerance / 100);
        const highLimit = spotPrice * (1 + liquiditySlippageTolerance / 100);

        if (position.positionType === 'ambient') {
            if (removalPercentage === 100) {
                try {
                    const tx = await pool.burnAmbientAll([lowLimit, highLimit]);
                    console.log(tx?.hash);
                    // setNewRemovalTransactionHash(tx?.hash);
                } catch (error) {
                    // setTxErrorCode(error?.code);
                    // setTxErrorMessage(error?.message);
                }
            } else {
                const positionLiq = position.positionLiq;

                const liquidityToBurn = ethers.BigNumber.from(positionLiq)
                    .mul(removalPercentage)
                    .div(100);

                try {
                    const tx = await pool.burnAmbientLiq(liquidityToBurn, [lowLimit, highLimit]);
                    console.log(tx?.hash);
                    // setNewRemovalTransactionHash(tx?.hash);
                } catch (error) {
                    // setTxErrorCode(error?.code);
                    // setTxErrorMessage(error?.message);
                }
            }
        } else if (position.positionType === 'concentrated') {
            const positionLiq = position.positionLiq;

            const liquidityToBurn = ethers.BigNumber.from(positionLiq)
                .mul(removalPercentage)
                .div(100);

            try {
                const tx = await pool.burnRangeLiq(
                    liquidityToBurn,
                    [position.bidTick, position.askTick],
                    [lowLimit, highLimit],
                );
                console.log(tx?.hash);
                // setNewRemovalTransactionHash(tx?.hash);
            } catch (error) {
                // setTxErrorCode(error?.code);
                // setTxErrorMessage(error?.message);
            }
        } else {
            console.log('unsupported position type for removal');
        }
    };

    // const removeRangeSettingsPage = (
    //     <div className={styles.remove_range_settings_container}>
    //         <RemoveRangeSettings showSettings={showSettings} setShowSettings={setShowSettings} />
    //     </div>
    // );
    return (
        <div className={styles.remove_range_container}>
            {/* {removeRangeSettingsPage} */}
            {/* <RemoveRangeSettings showSettings={showSettings} setShowSettings={setShowSettings} /> */}
            <div className={styles.header_container}>
                <RemoveRangeHeader
                    isPositionInRange={props.isPositionInRange}
                    isAmbient={props.isAmbient}
                    baseTokenSymbol={props.baseTokenSymbol}
                    quoteTokenSymbol={props.quoteTokenSymbol}
                    baseTokenLogoURI={props.baseTokenLogoURI}
                    quoteTokenLogoURI={props.quoteTokenLogoURI}
                    isDenomBase={props.isDenomBase}
                />
                {removeRangeSetttingIcon}
            </div>
            <div className={styles.main_content}>
                <RemoveRangeWidth
                    removalPercentage={removalPercentage}
                    setRemovalPercentage={setRemovalPercentage}
                />
                <RemoveRangeInfo
                    baseTokenSymbol={props.baseTokenSymbol}
                    quoteTokenSymbol={props.quoteTokenSymbol}
                    baseTokenLogoURI={props.baseTokenLogoURI}
                    quoteTokenLogoURI={props.quoteTokenLogoURI}
                    posLiqBaseDecimalCorrected={posLiqBaseDecimalCorrected}
                    posLiqQuoteDecimalCorrected={posLiqQuoteDecimalCorrected}
                    feeLiqBaseDecimalCorrected={feeLiqBaseDecimalCorrected}
                    feeLiqQuoteDecimalCorrected={feeLiqQuoteDecimalCorrected}
                    removalPercentage={removalPercentage}
                />
                <RemoveRangeButton removeFn={removeFn} />
            </div>
        </div>
    );
}
