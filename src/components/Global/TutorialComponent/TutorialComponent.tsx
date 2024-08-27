import { memo, useEffect, useRef, useState } from 'react';
import { TutorialStepIF } from '../../Chat/ChatIFs';
import styles from './TutorialComponent.module.css';
import { useNavigate } from 'react-router-dom';
import useMediaQuery from '../../../utils/hooks/useMediaQuery';
/* eslint-disable @typescript-eslint/no-explicit-any */

interface propsIF {
    tutoKey: string;
    steps: TutorialStepIF[];
    showSteps?: boolean;
    initialStep?: number;
    onComplete?: () => void;
}

function TutorialComponent(props: propsIF) {
    const { steps, tutoKey, initialStep, showSteps, onComplete } = props;

    const [hasTriggered, setHasTriggered] = useState<boolean>(false);
    const hasTriggeredRef = useRef<boolean>(false);

    const [stepIndex, setStepIndex] = useState<number>(
        initialStep ? initialStep : 0,
    );

    const stepIndexRef = useRef<number>();
    stepIndexRef.current = stepIndex;
    const [step, setStep] = useState<| TutorialStepIF | undefined>(
        steps.length > 0 && steps[stepIndex] ? steps[stepIndex] : undefined,
    );
    hasTriggeredRef.current = hasTriggered;

    const focusOverlay = useRef<HTMLDivElement>(null);
    const tooltipWrapper = useRef<HTMLDivElement>(null);

    const focusOffsetH = 20;
    const tooltipOffsetV = 20;

    
    const isMobile = useMediaQuery('(max-width: 800px)');
    // const focusOffsetV = 20;

    useEffect(() => {
        if (hasTriggeredRef.current) return;
        if (steps.length > 0) {
            triggerTutorial();
        }
    }, [tutoKey]);

    const nextStep = () => {
        const refVal =
            stepIndexRef && stepIndexRef.current
                ? stepIndexRef.current
                : stepIndex;

        if (refVal < steps.length - 1) {
            setStepIndex(refVal + 1);
        }
    };
    const prevStep = () => {
        const refVal =
            stepIndexRef && stepIndexRef.current
                ? stepIndexRef.current
                : stepIndex;

        if (refVal > 0) {
            setStepIndex(refVal - 1);
        }
    };

    const completeTutorial = () => {
        if (onComplete) {
            onComplete();
        }
    };

    const getTargetEl = () => {
        if (
            step &&
            document.querySelectorAll(step.element as string).length > 0
        ) {
            return document.querySelectorAll(step.element as string)[0];
        }

        return null;
    };

    const triggerAnimation = (el: HTMLDivElement | null) => {
        if (el) {
            el.classList.add(styles.animated);
            setTimeout(() => {
                el.classList.remove(styles.animated);
            }, 1000);
        }
    };

    const handleFocusOverlay = () => {
        const el = getTargetEl();
        if (el && focusOverlay.current) {
            focusOverlay.current.style.left =
                el.getBoundingClientRect().left - focusOffsetH / 2 + 'px';
            focusOverlay.current.style.top =
                el.getBoundingClientRect().top + 'px';
            focusOverlay.current.style.width =
                el.getBoundingClientRect().width + focusOffsetH + 'px';
            focusOverlay.current.style.height =
                el.getBoundingClientRect().height + 'px';
            triggerAnimation(focusOverlay.current);
        }
    };

    const handleTooltip = () => {
        const targetEl = getTargetEl();

        if (targetEl && tooltipWrapper.current) {
            // assign possitions to show bottom default
            let tooltipLeft =
                targetEl.getBoundingClientRect().left -
                tooltipWrapper.current.getBoundingClientRect().width / 2 +
                targetEl.getBoundingClientRect().width / 2;
            let tooltipTop =
                targetEl.getBoundingClientRect().bottom + tooltipOffsetV / 2;

            // target is on half bottom
            if (
                targetEl.getBoundingClientRect().top >
                window.innerHeight * 0.7
            ) {
                tooltipTop =
                    targetEl.getBoundingClientRect().top -
                    tooltipWrapper.current.getBoundingClientRect().height -
                    tooltipOffsetV / 2;
            }

            if (targetEl.getBoundingClientRect().bottom > window.innerHeight) {
                tooltipTop =
                    targetEl.getBoundingClientRect().top -
                    tooltipWrapper.current.getBoundingClientRect().height -
                    tooltipOffsetV / 2;
            }

            // handle overflows

            // left overflow
            if (tooltipLeft < 0) {
                tooltipLeft = 20;
            }

            // left overflow
            if (tooltipTop < 0) {
                tooltipTop = 20;
            }

            // bottom overflow
            if (
                tooltipTop +
                    tooltipWrapper.current.getBoundingClientRect().height >
                window.innerHeight
            ) {
                tooltipTop =
                    window.innerHeight -
                    tooltipWrapper.current.getBoundingClientRect().height -
                    100;
            }

            tooltipWrapper.current.style.left = tooltipLeft + 'px';
            tooltipWrapper.current.style.top = tooltipTop + 'px';
            triggerAnimation(tooltipWrapper.current);
        }
    };

    useEffect(() => {
        if (stepIndex < steps.length) {
            setStep(steps[stepIndex]);
        }
    }, [stepIndex]);

    useEffect(() => {
        const keyDownListener = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') {
                prevStep();
            } else if (e.key === 'ArrowRight') {
                nextStep();
            } else if (e.key === 'Escape') {
                completeTutorial();
                e.preventDefault();
            }
        };

        const resizeListener = () => {
            setTimeout(() => {
                handleFocusOverlay();
                handleTooltip();
            }, 300);
        };

        document.addEventListener('keydown', keyDownListener);

        window.addEventListener('resize', resizeListener);

        return () => {
            document.removeEventListener('keydown', keyDownListener);
            window.removeEventListener('resize', resizeListener);
        };
    }, []);

    const handleAssignments = () => {
        if(step?.assignment){
            const assignments = step.assignment.split(';');
            assignments.map((assign) => {
                const selector = assign.split('>')[0];
                const value = assign.split('>')[1];
                const el = document.querySelector(selector);
                if(el && el instanceof HTMLInputElement){
                    el.value = value;
                }
            })
        }
    }

    const handleActionTriggers = () => { 
        if(step?.actionTrigger){
            const el = document.querySelector(step.actionTrigger);
            if(el && el instanceof HTMLElement){
                el.click();
            }
        }
    }

    
    const navigate = useNavigate();

    const handlenNavigate = (url: string) => {
        navigate(url);
    }

    const renderNavigate = () => {
        if(step && step.navigate){
            const path = step.navigate.path;
            return (
                <div
                className={styles.step_btn + ' ' + styles.navigate}
                onClick={() => handlenNavigate(path)}
            >
                {'>>'} {step.navigate.label}
            </div>
            )
        }
    }

    useEffect(() => {
        handleFocusOverlay();
        handleTooltip();
        handleAssignments();
        handleActionTriggers();
    }, [step]);

    const triggerTutorial = () => {
        setHasTriggered(true);
    };

    const navButtons = (forTooltip?: boolean) => (
        <>
            {showSteps && (
                // <div className={styles.steps_indicator}>
                //     {stepIndex + 1}{' '}
                //     <span style={{ opacity: 0.5 }}>/ {steps.length}</span>
                // </div>
                <></>
            )}
            {
                forTooltip && isMobile ?
                (<> </>)
                :
                (<>
                    {
                    <div
                        className={`${styles.step_btn} ${styles.prev_btn} ${stepIndex == 0 ? styles.disabled : ''}`}
                        onClick={prevStep}
                    >
                        {'<'} Prev
                    </div>
                }
                {stepIndex < steps.length - 1 && (
                    <div
                        className={styles.step_btn + ' ' + styles.next_button}
                        onClick={nextStep}
                    >
                        Next {'>'}
                    </div>
                )}
                </>)
            }
            
            {stepIndex == steps.length - 1 && (
                <div
                    className={styles.step_btn + ' ' + styles.complete_button}
                    onClick={completeTutorial}
                >
                    Complete
                </div>
            )}
        </>
    );

    return (
        <div>
            <div className={styles.tutorial_overlay}></div>
            <div ref={focusOverlay} className={styles.focus_outline}></div>

            {step && (
                <div ref={tooltipWrapper} className={styles.tooltip_wrapper}>
                   
                    <div className={styles.tooltip_title}>{step.title}


                    {showSteps && (
                        <span className={styles.steps_on_tooltip}>
                            {stepIndex + 1}
                            <span style={{ opacity: 0.5 }}>/{steps.length}</span>
                        </span>
                    )}

                    </div>
                    <div className={styles.tooltip_content}>{step.intro}</div>  

                    <div className={styles.tooltip_buttons_wrapper}>
                        {navButtons(true)}
                        {renderNavigate()}
                    </div>

                    <div className={styles.step_dots_wrapper}>
                        {steps.map((_, i) => (
                            <div
                                key={i}
                                className={
                                    styles.step_dot +
                                    ' ' +
                                    (i === stepIndex ? styles.active : '')
                                }
                            ></div>
                        ))}
                    </div>
                </div>
            )}

            <div className={styles.tutorial_steps}>{navButtons(false)}</div>
        </div>
    );
}

export default memo(TutorialComponent);
