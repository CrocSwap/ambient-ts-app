import React from 'react';
import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';

import { FlexContainer } from '../../../styled/Common';
import Spinner from '../Spinner/Spinner';

interface Step {
    label: string;
}

interface VerticalStepperProps {
    steps: Step[];
    activeStep: number;
    setActiveStep: React.Dispatch<React.SetStateAction<number>>;
    isError: boolean;
}

const VerticalStepper: React.FC<VerticalStepperProps> = ({
    steps,
    activeStep,
    setActiveStep,
    isError,
}) => {
    const handleReset = () => {
        setActiveStep(0);
    };

    return (
        <Box sx={{ maxWidth: 400 }}>
            <Stepper activeStep={activeStep} orientation='vertical'>
                {steps.map((step, index) => (
                    <Step key={step.label}>
                        {activeStep === index ? (
                            isError ? (
                                <StepLabel error={isError}>
                                    {step.label}
                                </StepLabel>
                            ) : (
                                <FlexContainer gap={16}>
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

                        {/* <StepContent>
              <Box sx={{ mb: 2 }}>
                <div>
                  <Button variant="contained" onClick={handleNext} sx={{ mt: 1, mr: 1 }}>
                    {index === steps.length - 1 ? 'Finish' : 'Continue'}
                  </Button>
                  <Button disabled={index === 0} onClick={handleBack} sx={{ mt: 1, mr: 1 }}>
                    Back
                  </Button>
                </div>
              </Box>
            </StepContent> */}
                    </Step>
                ))}
            </Stepper>
            {activeStep === steps.length && (
                <div>
                    Everything is completed.
                    <button onClick={handleReset}>Reset</button>
                </div>
            )}
        </Box>
    );
};

export default VerticalStepper;
