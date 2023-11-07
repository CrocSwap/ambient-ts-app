import { FaMinus, FaPlus } from 'react-icons/fa';
import { ChangeEvent, FocusEventHandler, memo, useContext } from 'react';
import { TradeTableContext } from '../../../../../contexts/TradeTableContext';
import { exponentialNumRegEx } from '../../../../../utils/regex/exports';
import { FlexContainer, Text } from '../../../../../styled/Common';
import {
    PriceInputButton,
    PriceInputContainer,
    PriceInput as PriceInputStyled,
} from '../../../../../styled/Components/TradeModules';

interface propsIF {
    disable?: boolean;
    fieldId: string | number;
    title: string;
    percentageDifference: number;
    handleChangeEvent: (evt: ChangeEvent<HTMLInputElement>) => void;
    onBlur: FocusEventHandler<HTMLInputElement>;
    increaseTick: () => void;
    decreaseTick: () => void;
}

// this component is only used for min and max prices for a range position in
// ... advanced mode of the Range module, for some reason its value is set from
// ... a `useEffect()` hook in Range.tsx, I have not yet determined if there's
// ... a good reason to handle this with a side effect

function PriceInput(props: propsIF) {
    const {
        disable,
        fieldId,
        title,
        percentageDifference,
        handleChangeEvent,
        onBlur,
        increaseTick,
        decreaseTick,
    } = props;
    const { showRangePulseAnimation } = useContext(TradeTableContext);

    const percentageDifferenceString =
        percentageDifference >= 0
            ? '+' + percentageDifference
            : percentageDifference.toString();

    return (
        <FlexContainer
            flexDirection='column'
            justifyContent='center'
            alignItems='center'
            style={{ width: '48%' }}
            id={`range_${fieldId}_price`}
            gap={4}
        >
            <Text fontSize='body' color='text2'>
                {title}
            </Text>
            <PriceInputContainer>
                <PriceInputButton
                    onClick={decreaseTick}
                    aria-label={`decrease tick of ${fieldId} price.`}
                >
                    <FaMinus size={16} />
                </PriceInputButton>
                <FlexContainer
                    animation={showRangePulseAnimation ? 'pulse' : ''}
                >
                    <PriceInputStyled
                        id={`${fieldId}-price-input-quantity`}
                        type='text'
                        onChange={(event: ChangeEvent<HTMLInputElement>) =>
                            handleChangeEvent(event)
                        }
                        onBlur={onBlur}
                        inputMode='decimal'
                        autoComplete='off'
                        autoCorrect='off'
                        min='0'
                        minLength={1}
                        pattern={exponentialNumRegEx.source}
                        placeholder='0.0'
                        disabled={disable}
                        aria-label={`${fieldId} price input quantity.`}
                    />
                </FlexContainer>
                <PriceInputButton
                    onClick={increaseTick}
                    aria-label={`increase tick of ${fieldId} price.`}
                >
                    <FaPlus size={16} />
                </PriceInputButton>
            </PriceInputContainer>
            <Text
                fontSize='header2'
                color='accent5'
                tabIndex={0}
                aria-label={`Percentage difference is ${percentageDifferenceString} percent.`}
                aria-live='polite'
                aria-atomic='true'
                aria-relevant='all'
            >
                {percentageDifferenceString}%
            </Text>
        </FlexContainer>
    );
}

export default memo(PriceInput);
