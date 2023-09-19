// START: Import React and Dongles
import { Dispatch, memo, SetStateAction, useContext } from 'react';
import { AiOutlineInfoCircle } from 'react-icons/ai';

import { AppStateContext } from '../../../contexts/AppStateContext';
import { TradeTableContext } from '../../../contexts/TradeTableContext';

import {
    updateRangeWithButton,
    handleRangeSlider,
} from './rangeWidthFunctions';
import RangeSlider from '../RangeSlider';
import { Chip } from '../Chip';
import { ExplanationButton } from '../Icons/Icons.styles';
import { FlexContainer } from '../../../styled/Common';

// interface for React functional component props
interface RangeWidthPropsIF {
    rangeWidthPercentage: number;
    setRangeWidthPercentage: Dispatch<SetStateAction<number>>;
    setRescaleRangeBoundariesWithSlider: Dispatch<SetStateAction<boolean>>;
}

// React functional component
function RangeWidth(props: RangeWidthPropsIF) {
    const {
        rangeWidthPercentage,
        setRangeWidthPercentage,
        setRescaleRangeBoundariesWithSlider,
    } = props;
    const {
        globalPopup: { open: openGlobalPopup },
    } = useContext(AppStateContext);
    const { showRangePulseAnimation } = useContext(TradeTableContext);

    const PercentageOptionContent = (
        <>
            <FlexContainer
                fullWidth
                wrap
                justifyContent='center'
                alignItems='center'
                gap={4}
            >
                <Chip
                    variant={
                        rangeWidthPercentage === 5 ? 'filled' : 'secondary'
                    }
                    onClick={() => {
                        updateRangeWithButton(
                            (1 / 20) * 100,
                            setRangeWidthPercentage,
                        );
                        setRescaleRangeBoundariesWithSlider(true);
                    }}
                    aria-label='Set range width to 5%.'
                >
                    5%
                </Chip>
                <Chip
                    variant={
                        rangeWidthPercentage === 10 ? 'filled' : 'secondary'
                    }
                    onClick={() => {
                        updateRangeWithButton(
                            (1 / 10) * 100,
                            setRangeWidthPercentage,
                        );
                        setRescaleRangeBoundariesWithSlider(true);
                    }}
                    aria-label='Set range width to 10%.'
                >
                    10%
                </Chip>
                <Chip
                    variant={
                        rangeWidthPercentage === 25 ? 'filled' : 'secondary'
                    }
                    onClick={() => {
                        updateRangeWithButton(
                            (1 / 4) * 100,
                            setRangeWidthPercentage,
                        );
                        setRescaleRangeBoundariesWithSlider(true);
                    }}
                    aria-label='Set range width to 25%.'
                >
                    25%
                </Chip>
                <Chip
                    variant={
                        rangeWidthPercentage === 50 ? 'filled' : 'secondary'
                    }
                    onClick={() => {
                        updateRangeWithButton(
                            (1 / 2) * 100,
                            setRangeWidthPercentage,
                        );
                        setRescaleRangeBoundariesWithSlider(true);
                    }}
                    aria-label='Set range width to 50%.'
                >
                    50%
                </Chip>

                <Chip
                    variant={
                        rangeWidthPercentage === 100 ? 'filled' : 'secondary'
                    }
                    onClick={() => {
                        updateRangeWithButton(100, setRangeWidthPercentage);
                        setRescaleRangeBoundariesWithSlider(true);
                    }}
                    aria-label='use Ambient range width.'
                >
                    Ambient
                </Chip>
                <ExplanationButton
                    onClick={() =>
                        openGlobalPopup(
                            <div>
                                Ambient liquidity remains fully in range
                                regardless of pool price, but accumulates
                                rewards at lower rates.
                            </div>,
                            'Ambient Range Width',
                            'right',
                        )
                    }
                    aria-label='Open range width explanation popup.'
                >
                    <AiOutlineInfoCircle color='var(--text2)' />
                </ExplanationButton>
            </FlexContainer>
        </>
    );

    const rangeWidthTooltip = (
        <ExplanationButton
            style={{ margin: '0 8px', cursor: 'pointer' }}
            onClick={() =>
                openGlobalPopup(
                    <div>
                        <p>
                            Percentage width of the range around current pool
                            price.
                        </p>
                        <p>
                            Tighter ranges accumulate rewards at faster rates,
                            but are more likely to suffer divergence losses.
                        </p>
                    </div>,
                    'Range Width',
                    'right',
                )
            }
        >
            <AiOutlineInfoCircle size={17} />
        </ExplanationButton>
    );

    return (
        <FlexContainer
            fullWidth
            transition
            flexDirection='column'
            gap={16}
            id='range_width'
            margin='0 0 16px 0'
        >
            {PercentageOptionContent}
            <FlexContainer
                justifyContent='center'
                fontWeight='100'
                fontSize='header1'
                color='text1'
                animation={showRangePulseAnimation ? 'flicker' : ''}
                id='percentage-output'
                aria-live='polite'
                aria-atomic='true'
                aria-relevant='all'
            >
                {rangeWidthPercentage === 100
                    ? 'Ambient'
                    : '± ' + rangeWidthPercentage + '%'}
                {rangeWidthTooltip}
            </FlexContainer>
            <FlexContainer
                alignItems='center'
                padding='0 16px'
                height='40px'
                justifyContent='center'
            >
                <RangeSlider
                    percentageInput
                    defaultValue={rangeWidthPercentage}
                    id='input-slider-range'
                    onChange={(event) =>
                        handleRangeSlider(event, setRangeWidthPercentage)
                    }
                    onClick={() => {
                        setRescaleRangeBoundariesWithSlider(true);
                    }}
                />
            </FlexContainer>
        </FlexContainer>
    );
}

export default memo(RangeWidth);
