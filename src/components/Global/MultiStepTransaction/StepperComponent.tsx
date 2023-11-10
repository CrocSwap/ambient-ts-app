import React from 'react';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';

import { FlexContainer } from '../../../styled/Common';
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

    if (orientation === 'horizontal') {
        return (
            <Stepper activeStep={activeStep} alternativeLabel>
                {steps.map((label, index) => (
                    <Step key={label.label}>
                        {activeStep === index ? (
                            isError ? (
                                <StepLabel error={isError}>
                                    {label.label}
                                </StepLabel>
                            ) : (
                                <FlexContainer
                                    gap={16}
                                    flexDirection='column'
                                    alignItems='center'
                                >
                                    <Spinner
                                        size={24}
                                        bg='var(--dark2)'
                                        weight={2}
                                    />
                                    {label.label}
                                </FlexContainer>
                            )
                        ) : (
                            <StepLabel>
                                <p style={{ color: 'var(--text3)' }}>
                                    {label.label}
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
            <Stepper activeStep={activeStep} orientation='vertical'>
                {steps?.map((step, index) => (
                    <Step key={step?.label}>
                        {activeStep === index ? (
                            isError ? (
                                <StepLabel error={isError}>
                                    {step?.label}
                                </StepLabel>
                            ) : (
                                <FlexContainer gap={32}>
                                    <Spinner
                                        size={24}
                                        bg='var(--dark2)'
                                        weight={2}
                                    />

                                    {step?.label}
                                </FlexContainer>
                            )
                        ) : (
                            <StepLabel>
                                <p style={{ color: 'var(--text3)' }}>
                                    {step?.label}
                                </p>
                            </StepLabel>
                        )}
                    </Step>
                ))}
            </Stepper>

            {activeStep === steps?.length &&
                completedDisplay &&
                completedDisplay}
            {isError && errorDisplay && errorDisplay}
        </FlexContainer>
    );
};

export default StepperComponent;
