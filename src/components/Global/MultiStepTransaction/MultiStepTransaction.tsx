import React, { Dispatch, SetStateAction, useEffect } from 'react';

export interface SlideInProps {
    isVisible: boolean;
    children: React.ReactNode;
}

export interface StepProps {
    onNext: () => void;
    onPrevious: () => void;
}

export interface TransactionStep {
    component: React.FC<StepProps>;
}

export interface MultiStepTransactionProps {
    steps: TransactionStep[];
    currentStep: number;
    setCurrentStep: Dispatch<SetStateAction<number>>;
    // onNext: () =>  void;
    // onPrevious: () => void;
}

const MultiStepTransaction: React.FC<MultiStepTransactionProps> = ({
    steps,
    currentStep,
    setCurrentStep,
}) => {
    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            setCurrentStep(0); // Reset to the first step on completion
        }
    };

    const handlePrevious = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    useEffect(() => {
        if (currentStep < 0) {
            setCurrentStep(0);
        } else if (currentStep >= steps.length) {
            setCurrentStep(steps.length - 1);
        }
    }, [currentStep]);

    return (
        <section>
            <div>
                {steps.map((step, index) => (
                    <div
                        key={index}
                        style={{
                            position: 'absolute',
                            width: '100%',
                            transition: ' opacity 0.5s ease',
                            opacity: currentStep === index ? 1 : 0,
                        }}
                    >
                        <step.component
                            onNext={handleNext}
                            onPrevious={handlePrevious}
                        />
                    </div>
                ))}
            </div>
        </section>
    );
};

export default MultiStepTransaction;
