import { MouseEvent, useState } from 'react';
import { FaGasPump } from 'react-icons/fa';
import { RiArrowDownSLine, RiArrowUpSLine } from 'react-icons/ri';
import { FlexContainer } from '../../../../styled/Common';
import {
    ExtraDetailsContainer,
    ExtraInfoContainer,
} from '../../../../styled/Components/TradeModules';
import { useAppDispatch } from '../../../../utils/hooks/reduxToolkit';
import { toggleDidUserFlipDenom } from '../../../../utils/state/tradeDataSlice';
import TooltipComponent from '../../../Global/TooltipComponent/TooltipComponent';

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

    return (
        <>
            <ExtraInfoContainer
                role='button'
                justifyContent='space-between'
                alignItems='center'
                fullWidth
                color='text2'
                fontSize='body'
                padding='4px'
                active={showDropdown}
                onClick={
                    showDropdown
                        ? () => setShowExtraInfo(!showExtraInfo)
                        : () => setShowExtraInfo(false)
                }
                aria-label={`Gas cost is ${gasPrice}. Conversion rate is ${conversionRate}.`}
            >
                <FlexContainer
                    alignItems='center'
                    padding='0 0 0 4px'
                    gap={4}
                    style={{ pointerEvents: 'none' }}
                >
                    <FaGasPump size={15} /> {gasPrice ?? '…'}
                </FlexContainer>
                <FlexContainer
                    alignItems='center'
                    onClick={(e: MouseEvent<HTMLDivElement>) => {
                        dispatch(toggleDidUserFlipDenom());
                        e.stopPropagation();
                    }}
                >
                    {conversionRate}
                </FlexContainer>

                {showDropdown && !showExtraInfo && (
                    <RiArrowDownSLine size={22} />
                )}
                {showDropdown && showExtraInfo && <RiArrowUpSLine size={22} />}
            </ExtraInfoContainer>
            {showExtraInfo && (
                <ExtraDetailsContainer>
                    {extraInfo.map((item, idx) => (
                        <FlexContainer
                            key={idx}
                            justifyContent='space-between'
                            alignItems='center'
                            padding='4px 0'
                            tabIndex={0}
                            aria-label={`${item.title} is ${item.data}`}
                        >
                            <FlexContainer gap={4}>
                                <div>{item.title}</div>
                                <TooltipComponent title={item.tooltipTitle} />
                            </FlexContainer>
                            <div>{item.data}</div>
                        </FlexContainer>
                    ))}
                </ExtraDetailsContainer>
            )}
        </>
    );
};
