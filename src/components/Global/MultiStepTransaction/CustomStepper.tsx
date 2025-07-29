import { ReactNode } from 'react';
import styles from './StepperComponent.module.css';

export interface StepProps {
    label: string;
    completed?: boolean;
    active?: boolean;
    index: number;
    isLast?: boolean;
}

export const Step = ({
    label,
    completed = false,
    active = false,
    index,
    isLast = false,
}: StepProps) => {
    return (
        <div
            className={`${styles.step} ${active ? styles.active : ''} ${completed ? styles.completed : ''}`}
        >
            <div className={styles.stepCircle}>
                {completed ? (
                    <span className={styles.stepIcon}>✓</span>
                ) : (
                    <span className={styles.stepNumber}>{index + 1}</span>
                )}
            </div>
            <div className={styles.stepLabel}>{label}</div>
            {!isLast && <div className={styles.stepConnector} />}
        </div>
    );
};

interface StepperProps {
    activeStep: number;
    orientation?: 'horizontal' | 'vertical';
    children: ReactNode;
}

export const Stepper = ({
    activeStep,
    orientation = 'horizontal',
    children,
}: StepperProps) => {
    const steps = Array.isArray(children) ? children : [children];

    return (
        <div className={`${styles.stepper} ${styles[orientation]}`}>
            {steps.map((step: any, index: number) => {
                if (!step) return null;
                return {
                    ...step,
                    props: {
                        ...step.props,
                        index,
                        active: index === activeStep,
                        completed: index < activeStep,
                        isLast: index === steps.length - 1,
                    },
                };
            })}
        </div>
    );
};

export const StepLabel = ({ children }: { children: ReactNode }) => {
    return <>{children}</>;
};
