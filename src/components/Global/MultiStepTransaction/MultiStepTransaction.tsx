import React, { useState } from 'react';

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
}

const MultiStepTransaction: React.FC<MultiStepTransactionProps> = ({
    steps,
}) => {
    const [currentStep, setCurrentStep] = useState(0);

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

    // const CurrentStepComponent = steps[currentStep].component;

    // const nextButton = (
    //     <>
    //         {currentStep === steps.length - 1 ? (
    //             <button onClick={handleNext}>Confirm</button>
    //         ) : (
    //             <button
    //                 onClick={handleNext}
    //                 disabled={currentStep === steps.length - 1}
    //             >
    //                 Next
    //             </button>
    //         )}
    //     </>
    // );

    return (
        <section>
            <button onClick={handleNext}>here</button>
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
