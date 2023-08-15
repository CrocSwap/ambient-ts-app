import { useState } from 'react';
import { FaGasPump } from 'react-icons/fa';
import { RiArrowDownSLine, RiArrowUpSLine } from 'react-icons/ri';
import { useAppDispatch } from '../../../../utils/hooks/reduxToolkit';
import { toggleDidUserFlipDenom } from '../../../../utils/state/tradeDataSlice';
import TooltipComponent from '../../../Global/TooltipComponent/TooltipComponent';
import styles from './ExtraInfo.module.css';

interface PropsIF {
    extraInfo: {
        title: string;
        tooltipTitle: string;
        data: React.ReactNode;
    }[];
    conversionRate: string;
    gasPrice: string | undefined;
    showDropdown: boolean;
}

export const ExtraInfo = (props: PropsIF) => {
    const { extraInfo, showDropdown, conversionRate, gasPrice } = props;

    const dispatch = useAppDispatch();

    const [showExtraInfo, setShowExtraInfo] = useState<boolean>(false);
    const [isConvHovered, setIsConHovered] = useState(false);

    return (
        <>
            <button
                className={`${styles.extra_info_content} ${
                    showDropdown && styles.extra_info_content_active
                }`}
                onClick={
                    showDropdown
                        ? () => setShowExtraInfo(!showExtraInfo)
                        : () => setShowExtraInfo(false)
                }
                aria-label={`Gas cost is ${gasPrice}. Conversion rate is ${conversionRate}.`}
            >
                <div className={styles.gas_pump}>
                    <FaGasPump size={15} /> {gasPrice ?? '…'}
                </div>
                <div
                    className={styles.token_amount}
                    onClick={(e) => {
                        dispatch(toggleDidUserFlipDenom());
                        e.stopPropagation();
                    }}
                    onMouseEnter={() => setIsConHovered(true)}
                    onMouseOut={() => setIsConHovered(false)}
                >
                    {conversionRate}
                </div>

                {showDropdown && !showExtraInfo && (
                    <RiArrowDownSLine
                        size={22}
                        className={
                            isConvHovered
                                ? styles.non_hovered_arrow
                                : styles.dropdown_arrow
                        }
                    />
                )}
                {showDropdown && showExtraInfo && (
                    <RiArrowUpSLine
                        size={22}
                        className={
                            isConvHovered
                                ? styles.non_hovered_arrow
                                : styles.dropdown_arrow
                        }
                    />
                )}
            </button>
            {showExtraInfo && (
                <div className={styles.extra_details_container}>
                    <div className={styles.extra_details}>
                        {extraInfo.map((item, idx) => (
                            <div
                                className={styles.extra_row}
                                key={idx}
                                tabIndex={0}
                                aria-label={`${item.title} is ${item.data}`}
                            >
                                <div className={styles.align_center}>
                                    <div>{item.title}</div>
                                    <TooltipComponent
                                        title={item.tooltipTitle}
                                    />
                                </div>
                                <div className={styles.data}>{item.data}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </>
    );
};
