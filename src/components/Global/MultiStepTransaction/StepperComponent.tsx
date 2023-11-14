import React from 'react';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import StepConnector, {
    stepConnectorClasses,
} from '@mui/material/StepConnector';
import styled from 'styled-components';

import { FlexContainer } from '../../../styled/Common';
import Spinner from '../Spinner/Spinner';

interface Step {
    label: string;
}

interface StepperComponentProps {
    steps: Step[];
    activeStep: number;
    setActiveStep: React.Dispatch<React.SetStateAction<number>>;
    isError: boolean;
    orientation: 'vertical' | 'horizontal';
    completedDisplay?: React.ReactNode;
    errorDisplay?: React.ReactNode;
}

const StepperComponent: React.FC<StepperComponentProps> = ({
    steps,
    activeStep,
    setActiveStep,
    isError,
    orientation,
    completedDisplay,
    errorDisplay,
}) => {
    // eslint-disable-next-line
    const handleReset = () => {
        setActiveStep(0);
    };
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

    if (orientation === 'horizontal') {
        return (
            <Stepper
                activeStep={activeStep}
                orientation='vertical'
                connector={<CustomConnector />}
            >
                {steps.map((step, index) => (
                    <Step key={step.label}>
                        {index > activeStep ? (
                            <FlexContainer gap={8} alignItems='center'>
                                <CircularBorder />
                                {step.label}
                            </FlexContainer>
                        ) : activeStep === index ? (
                            isError ? (
                                <FlexContainer gap={8} alignItems='center'>
                                    <CircularBorderWithExclamation>
                                        !
                                    </CircularBorderWithExclamation>
                                    {step.label}
                                </FlexContainer>
                            ) : (
                                <FlexContainer gap={8} alignItems='center'>
                                    <Spinner
                                        size={24}
                                        bg='var(--dark2)'
                                        weight={2}
                                    />
                                    {step.label}
                                </FlexContainer>
                            )
                        ) : (
                            <StepLabel>
                                <p style={{ color: 'var(--text3)' }}>
                                    {step.label}
                                </p>
                            </StepLabel>
                        )}
                    </Step>
                ))}
            </Stepper>
        );
    }

    return (
        <FlexContainer flexDirection='column'>
            <Stepper
                activeStep={activeStep}
                orientation='vertical'
                connector={<CustomConnector />}
            >
                {steps.map((step, index) => (
                    <Step key={step.label}>
                        {index > activeStep ? (
                            <FlexContainer gap={8} alignItems='center'>
                                <CircularBorder />
                                {step.label}
                            </FlexContainer>
                        ) : activeStep === index ? (
                            isError ? (
                                <FlexContainer
                                    gap={8}
                                    alignItems='center'
                                    style={{ color: '#f6385b' }}
                                >
                                    <CircularBorderWithExclamation>
                                        !
                                    </CircularBorderWithExclamation>
                                    {step.label}
                                </FlexContainer>
                            ) : (
                                <FlexContainer gap={8} alignItems='center'>
                                    <Spinner
                                        size={24}
                                        bg='var(--dark2)'
                                        weight={2}
                                    />
                                    {step.label}
                                </FlexContainer>
                            )
                        ) : (
                            <StepLabel>
                                <p style={{ color: 'var(--text3)' }}>
                                    {step.label}
                                </p>
                            </StepLabel>
                        )}
                    </Step>
                ))}
            </Stepper>

            {activeStep === steps.length &&
                completedDisplay &&
                completedDisplay}
            {isError && errorDisplay && errorDisplay}
        </FlexContainer>
    );
};

export default StepperComponent;
