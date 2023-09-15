import { styled } from 'styled-components/macro';
import { FlexContainer, FontSize } from '../../styled/Common';
import MultiStepTransaction, {
    TransactionStep,
} from '../../components/Global/MultiStepTransaction/MultiStepTransaction';
import { StylesProvider } from '@material-ui/core';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const StepContainer = styled.div`
    height: 400px;
    width: 100%;
    background: var(--dark2);
    display: flex;
    justify-content: center;
    align-items: center;
    transition: opacity 500ms ease-in-out;
    overflow: hidden;
`;

export default function TestPage() {
    const Step1 = () => {
        return (
            <StepContainer>
                <h2>Step 1</h2>
            </StepContainer>
        );
    };

    const Step2 = () => {
        return (
            <StepContainer>
                <h2>Step 2</h2>
            </StepContainer>
        );
    };

    const Step3 = () => {
        return (
            <StepContainer>
                <h2>Step 3</h2>
            </StepContainer>
        );
    };

    // Define steps array
    const steps: TransactionStep[] = [
        { component: Step1 },
        { component: Step2 },
        { component: Step3 },
    ];

    const [transformStyle, setTransformStyle] = useState('translateX(-100%)');

    useEffect(() => {
        // Delay the transition to allow the component to render first
        setTimeout(() => {
            setTransformStyle('translateX(0)');
        }, 10);
    }, []);
    return (
        <section style={{ width: '70%', margin: '10% auto' }}>
            <h1>Multi-Step Transaction Example</h1>
            <MultiStepTransaction steps={steps} />
        </section>
    );
}
