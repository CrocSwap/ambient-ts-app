import Divider from '../Global/Divider/Divider';
import RemoveRangeHeader from '../RemoveRange/RemoveRangeHeader/RemoveRangeHeader';
import PriceInfo from './PriceInfo/PriceInfo';
import styles from './RangeDetails.module.css';
import TokenInfo from './TokenInfo/TokenInfo';
import { ethers } from 'ethers';
import { useRef } from 'react';
import { BsDownload } from 'react-icons/bs';
import printDomToImage from '../../utils/functions/printDomToImage';
interface IRangeDetailsProps {
    provider: ethers.providers.Provider | undefined;
    chainId: string;
    isPositionInRange: boolean;
    isAmbient: boolean;
    baseTokenSymbol: string;
    baseTokenDecimals: number;
    quoteTokenSymbol: string;
    quoteTokenDecimals: number;
    lowRangeDisplay: string;
    highRangeDisplay: string;
    isDenomBase: boolean;
    baseTokenLogoURI: string;
    quoteTokenLogoURI: string;
    baseTokenAddress: string;
    quoteTokenAddress: string;
    lastBlockNumber: number;
}

export default function RangeDetails(props: IRangeDetailsProps) {
    const { lowRangeDisplay, highRangeDisplay, chainId } = props;

    const detailsRef = useRef(null);
    const downloadAsImage = () => {
        if (detailsRef.current) {
            printDomToImage(detailsRef.current);
        }
    };
    return (
        <div className={styles.range_details_container}>
            <div ref={detailsRef}>
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
                    <TokenInfo
                        provider={props.provider}
                        chainId={chainId}
                        baseTokenAddress={props.baseTokenAddress}
                        baseTokenDecimals={props.baseTokenDecimals}
                        quoteTokenAddress={props.quoteTokenAddress}
                        quoteTokenDecimals={props.quoteTokenDecimals}
                        lastBlockNumber={props.lastBlockNumber}
                        isDenomBase={props.isDenomBase}
                    />
                    <Divider />
                </div>
                <PriceInfo lowRangeDisplay={lowRangeDisplay} highRangeDisplay={highRangeDisplay} />
            </div>
            <div onClick={downloadAsImage} className={styles.share_container}>
                <BsDownload size={15} />
            </div>
        </div>
    );
}
