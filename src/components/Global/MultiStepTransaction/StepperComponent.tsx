import React from 'react';
import styled from 'styled-components';

import { FlexContainer } from '../../../styled/Common';
import Spinner from '../Spinner/Spinner';

interface StepType {
    label: string;
}

interface StepperComponentProps {
    steps: StepType[];
    activeStep: number;
    setActiveStep: React.Dispatch<React.SetStateAction<number>>;
    isError: boolean;
    orientation?: 'vertical' | 'horizontal';
    completedDisplay?: React.ReactNode;
    errorDisplay?: React.ReactNode;
}

const StepperContainer = styled(FlexContainer)`
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
    width: 100%;
`;

const StepContent = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    margin-top: 16px;
`;

const StepIcon = styled.div<{
    active: boolean;
    completed: boolean;
    error: boolean;
}>`
    width: 24px;
    height: 24px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: ${(props) =>
        props.error
            ? '#f6385b'
            : props.completed || props.active
              ? '#7371fc'
              : '#61646f'};
    color: white;
    font-weight: bold;
    font-size: 12px;
`;

const StepLabelText = styled.span<{ active: boolean; completed: boolean }>`
    color: ${(props) =>
        props.active || props.completed ? '#7371fc' : '#61646f'};
    font-weight: ${(props) => (props.active ? 'bold' : 'normal')};
    margin-top: 8px;
`;

const StepperComponent: React.FC<StepperComponentProps> = ({
    steps,
    activeStep,
    setActiveStep,
    isError,
    orientation = 'horizontal',
    completedDisplay,
    errorDisplay,
}) => {
    const handleReset = () => {
        setActiveStep(0);
    };

    const isStepComplete = (stepIndex: number) => {
        return stepIndex < activeStep;
    };

    const isStepActive = (stepIndex: number) => {
        return stepIndex === activeStep;
    };

    const getStepStatus = (stepIndex: number) => {
        if (isError && stepIndex === activeStep) return 'error';
        if (isStepComplete(stepIndex)) return 'completed';
        if (isStepActive(stepIndex)) return 'active';
        return 'inactive';
    };

    const renderStepIcon = (stepIndex: number) => {
        const status = getStepStatus(stepIndex);

        if (status === 'error') {
            return (
                <StepIcon active={false} completed={false} error={true}>
                    !
                </StepIcon>
            );
        }

        if (status === 'completed') {
            return (
                <StepIcon active={false} completed={true} error={false}>
                    ✓
                </StepIcon>
            );
        }

        return (
            <StepIcon
                active={isStepActive(stepIndex)}
                completed={isStepComplete(stepIndex)}
                error={false}
            >
                {stepIndex + 1}
            </StepIcon>
        );
    };

    const renderStepLabel = (step: StepType, index: number) => {
        const status = getStepStatus(index);
        const isActive = status === 'active';
        const isCompleted = status === 'completed';

        return (
            <StepLabelText active={isActive} completed={isCompleted}>
                {step.label}
            </StepLabelText>
        );
    };

    if (steps.length === 0) {
        return null;
    }

    if (isError && errorDisplay) {
        return (
            <StepperContainer>
                {errorDisplay}
                <button onClick={handleReset}>Reset</button>
            </StepperContainer>
        );
    }

    if (activeStep >= steps.length && completedDisplay) {
        return (
            <StepperContainer>
                {completedDisplay}
                <button onClick={handleReset}>Reset</button>
            </StepperContainer>
        );
    }

    return (
        <StepperContainer>
            <div
                style={{
                    display: 'flex',
                    width: '100%',
                    justifyContent:
                        orientation === 'horizontal'
                            ? 'space-between'
                            : 'flex-start',
                    flexDirection:
                        orientation === 'horizontal' ? 'row' : 'column',
                }}
            >
                {steps.map((step, index) => (
                    <div
                        key={index}
                        style={{
                            display: 'flex',
                            flexDirection:
                                orientation === 'horizontal' ? 'column' : 'row',
                            alignItems: 'center',
                            flex: orientation === 'horizontal' ? 1 : 'none',
                            marginBottom:
                                orientation === 'vertical' ? '16px' : 0,
                            position: 'relative',
                        }}
                    >
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                            }}
                        >
                            {renderStepIcon(index)}
                            {orientation === 'horizontal' &&
                                renderStepLabel(step, index)}
                        </div>
                        {orientation === 'vertical' && (
                            <div
                                style={{
                                    marginLeft: '16px',
                                    textAlign: 'left',
                                }}
                            >
                                {renderStepLabel(step, index)}
                            </div>
                        )}
                        {index < steps.length - 1 && (
                            <div
                                style={{
                                    position:
                                        orientation === 'horizontal'
                                            ? 'absolute'
                                            : 'static',
                                    top:
                                        orientation === 'horizontal'
                                            ? '12px'
                                            : 'auto',
                                    left:
                                        orientation === 'horizontal'
                                            ? 'calc(50% + 12px)'
                                            : '12px',
                                    right:
                                        orientation === 'horizontal'
                                            ? 'calc(-50% + 24px)'
                                            : 'auto',
                                    height:
                                        orientation === 'horizontal'
                                            ? '2px'
                                            : '20px',
                                    width:
                                        orientation === 'horizontal'
                                            ? '100%'
                                            : '2px',
                                    backgroundColor: isStepComplete(index + 1)
                                        ? '#7371fc'
                                        : '#61646f',
                                    zIndex: 0,
                                }}
                            />
                        )}
                    </div>
                ))}
            </div>

            <StepContent>
                {steps[Math.min(activeStep, steps.length - 1)]?.label && (
                    <h3>
                        {steps[Math.min(activeStep, steps.length - 1)].label}
                    </h3>
                )}
                {isError && errorDisplay && (
                    <div style={{ color: '#f6385b', marginTop: '8px' }}>
                        {errorDisplay}
                    </div>
                )}
                {activeStep >= steps.length && completedDisplay && (
                    <div style={{ marginTop: '16px' }}>{completedDisplay}</div>
                )}
            </StepContent>

            <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
                <button
                    onClick={() =>
                        setActiveStep((prev) => Math.max(0, prev - 1))
                    }
                    disabled={activeStep === 0}
                >
                    Back
                </button>
                {activeStep < steps.length - 1 ? (
                    <button
                        onClick={() =>
                            setActiveStep((prev) =>
                                Math.min(steps.length - 1, prev + 1),
                            )
                        }
                        disabled={isError}
                    >
                        Next
                    </button>
                ) : (
                    <button onClick={handleReset}>
                        {activeStep >= steps.length ? 'Restart' : 'Finish'}
                    </button>
                )}
            </div>
        </StepperContainer>
    );
};

export default StepperComponent;
