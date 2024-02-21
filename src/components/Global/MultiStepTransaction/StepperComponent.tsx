import React from 'react';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepConnector, {
    stepConnectorClasses,
} from '@mui/material/StepConnector';
import styled from 'styled-components';

import { FlexContainer, Text } from '../../../styled/Common';
import Spinner from '../Spinner/Spinner';

interface Step {
    label: string;
}

interface StepperComponentProps {
    steps: Step[] | undefined;
    activeStep: number | undefined;
    setActiveStep: React.Dispatch<React.SetStateAction<number>> | undefined;
    isError: boolean;
    orientation: 'vertical' | 'horizontal';
    completedDisplay?: React.ReactNode;
    errorDisplay?: React.ReactNode;
}
const CustomConnector = styled(StepConnector)`
    &.${stepConnectorClasses.alternativeLabel} {
    }

    &.${stepConnectorClasses.active} .${stepConnectorClasses.line} {
        border-color: #7371fc;
    }

    &.${stepConnectorClasses.completed} .${stepConnectorClasses.line} {
        border-color: #7371fc;
    }
    .${stepConnectorClasses.line} {
        border-color: #61646f;

        border-width: 2px;
    }
`;

const CircularBorder = styled.div`
    width: 24px;
    height: 24px;
    border: 2px solid #61646f;
    border-radius: 50%;
`;

const CircularBorderWithExclamation = styled.div`
    width: 24px;
    height: 24px;
    border: 2px solid red;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--header2-size);
    color: #f6385b;
`;

const StepperComponent: React.FC<StepperComponentProps> = ({
    steps,
    activeStep,
    setActiveStep,
    isError,
    orientation,
    completedDisplay,
    errorDisplay,
}) => {
    if (!steps) return null;
    // eslint-disable-next-line
    const handleReset = () => {
        setActiveStep && setActiveStep(0);
    };

    if (orientation === 'horizontal')
        return <FlexContainer>In progress</FlexContainer>;

    return (
        <FlexContainer
            flexDirection='column'
            justifyContent='center'
            alignItems='center'
            width='100%'
        >
            <Stepper
                activeStep={activeStep}
                orientation='vertical'
                connector={<CustomConnector />}
            >
                {steps.map((step, index) => {
                    const isPreviousStep = activeStep && index < activeStep;
                    const isActiveStep = index === activeStep;

                    let content;

                    const circularBorderContent = (
                        <FlexContainer gap={32} alignItems='center'>
                            <CircularBorder />
                            <Text color='text1' fontSize='header2'>
                                {step.label}
                            </Text>
                        </FlexContainer>
                    );

                    const spinnerContent = (
                        <FlexContainer gap={32} alignItems='center'>
                            <Spinner size={24} bg='var(--dark2)' weight={2} />
                            <Text color='text1' fontSize='header2'>
                                {step.label}
                            </Text>
                        </FlexContainer>
                    );

                    const errorContent = (
                        <FlexContainer
                            gap={32}
                            alignItems='center'
                            style={{ color: '#f6385b' }}
                        >
                            <CircularBorderWithExclamation>
                                !
                            </CircularBorderWithExclamation>
                            {step.label}
                        </FlexContainer>
                    );

                    const completedContent = (
                        <FlexContainer gap={32} alignItems='center'>
                            <svg
                                xmlns='http://www.w3.org/2000/svg'
                                width='25'
                                height='24'
                                viewBox='0 0 25 24'
                                fill='none'
                            >
                                <g clipPath='url(#clip0_8130_5628)'>
                                    <path
                                        d='M23.75 12C23.75 18.3515 18.6015 23.5 12.25 23.5C5.89854 23.5 0.75 18.3515 0.75 12C0.75 5.64854 5.89854 0.5 12.25 0.5C18.6015 0.5 23.75 5.64854 23.75 12Z'
                                        fill='#7371FC'
                                        stroke='#7371FC'
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                    />
                                    <path
                                        d='M7.75 12L10.75 15L16.75 9'
                                        stroke='#F0F0F8'
                                        strokeWidth='2.25'
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                    />
                                </g>
                                <defs>
                                    <clipPath id='clip0_8130_5628'>
                                        <rect
                                            width='24'
                                            height='24'
                                            fill='white'
                                            transform='translate(0.25)'
                                        />
                                    </clipPath>
                                </defs>
                            </svg>

                            <Text color='text1' fontSize='header2'>
                                {step.label}
                            </Text>
                        </FlexContainer>
                    );

                    if (isPreviousStep) {
                        content = completedContent;
                    } else if (isActiveStep) {
                        content = isError ? errorContent : spinnerContent;
                    } else {
                        content = circularBorderContent;
                    }

                    return <Step key={step.label}>{content}</Step>;
                })}
            </Stepper>

            {activeStep === steps?.length &&
                completedDisplay &&
                completedDisplay}
            {isError && errorDisplay && errorDisplay}
        </FlexContainer>
    );
};

export default StepperComponent;
