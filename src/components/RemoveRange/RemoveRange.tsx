import styles from './RemoveRange.module.css';
import RemoveRangeWidth from './RemoveRangeWidth/RemoveRangeWidth';
import RemoveRangeHeader from './RemoveRangeHeader/RemoveRangeHeader';
import RemoveRangeInfo from './RemoveRangeInfo/RemoveRangInfo';
import RemoveRangeButton from './RemoveRangeButton/RemoveRangeButton';
import { useEffect, useState } from 'react';

interface IRemoveRangeProps {
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
}

export default function RemoveRange(props: IRemoveRangeProps) {
    const {
        chainId,
        poolIdx,
        user,
        bidTick,
        askTick,
        baseTokenAddress,
        quoteTokenAddress,
        lastBlockNumber,
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
        if (chainId && poolIdx && user && baseTokenAddress && quoteTokenAddress) {
            (async () => {
                if (bidTick && askTick) {
                    fetch(
                        positionStatsCacheEndpoint +
                            new URLSearchParams({
                                chainId: chainId,
                                user: user,
                                base: baseTokenAddress,
                                quote: quoteTokenAddress,
                                poolIdx: poolIdx.toString(),
                                bidTick: bidTick.toString(),
                                askTick: askTick.toString(),
                                calcValues: 'true',
                            }),
                    )
                        .then((response) => response.json())
                        .then((json) => {
                            setPosLiqBaseDecimalCorrected(json?.data?.posLiqBaseDecimalCorrected);
                            setPosLiqQuoteDecimalCorrected(json?.data?.posLiqQuoteDecimalCorrected);
                            setFeeLiqBaseDecimalCorrected(json?.data?.feeLiqBaseDecimalCorrected);
                            setFeeLiqQuoteDecimalCorrected(json?.data?.feeLiqQuoteDecimalCorrected);
                        });
                } else {
                    fetch(
                        positionStatsCacheEndpoint +
                            new URLSearchParams({
                                chainId: chainId,
                                user: user,
                                base: baseTokenAddress,
                                quote: quoteTokenAddress,
                                poolIdx: poolIdx.toString(),
                                calcValues: 'true',
                            }),
                    )
                        .then((response) => response.json())
                        .then((json) => {
                            setPosLiqBaseDecimalCorrected(json?.data?.posLiqBaseDecimalCorrected);
                            setPosLiqQuoteDecimalCorrected(json?.data?.posLiqQuoteDecimalCorrected);
                            setFeeLiqBaseDecimalCorrected(json?.data?.feeLiqBaseDecimalCorrected);
                            setFeeLiqQuoteDecimalCorrected(json?.data?.feeLiqQuoteDecimalCorrected);
                        });
                }
            })();
        }
    }, [lastBlockNumber]);

    return (
        <div className={styles.remove_Range_container}>
            <RemoveRangeHeader
                isPositionInRange={props.isPositionInRange}
                isAmbient={props.isAmbient}
                baseTokenSymbol={props.baseTokenSymbol}
                quoteTokenSymbol={props.quoteTokenSymbol}
                baseTokenLogoURI={props.baseTokenLogoURI}
                quoteTokenLogoURI={props.quoteTokenLogoURI}
                isDenomBase={props.isDenomBase}
            />
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
                />
                <RemoveRangeButton removalPercentage={removalPercentage} />
            </div>
        </div>
    );
}
