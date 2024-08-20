import { Steps, Step } from 'intro.js-react';
import 'intro.js/introjs.css';
import { useState, useEffect, useRef, memo } from 'react';
import { generateObjectHash, getLS, setLS } from '../../Chat/ChatUtils';
import { TutorialIF } from '../../Chat/ChatIFs';
import { useLinkGen } from '../../../utils/hooks/useLinkGen';
import { futaAuctionsSteps } from '../../../utils/tutorial/Futa/AuctionsSteps';
import { futaCreateSteps } from '../../../utils/tutorial/Futa/FutaCreateSteps';
import styles from './TutorialOverlayUrlDetech.module.css';
import { domDebug } from '../../Chat/DomDebugger/DomDebuggerUtils';
import DomDebugger from '../../Chat/DomDebugger/DomDebugger';
// import { MdOutlineArrowForwardIos, MdOutlineArrowBackIos, MdClose} from 'react-icons/md'

interface TutorialOverlayPropsIF {
    checkStepHash?: boolean;
}
function TutorialOverlayUrlDetect(props: TutorialOverlayPropsIF) {
    const { checkStepHash } = props;

    const [showTutorial, setShowTutorial] = useState<boolean>(false);

    const { currentPage } = useLinkGen();
    const [selectedTutorial, setSelectedTutorial] = useState<
        TutorialIF | undefined
    >();
    const selectedTutorialRef = useRef<TutorialIF | undefined>();
    const [initialRender, setInitialRender] = useState<boolean>(true);
    const initialRenderRef = useRef<boolean>();
    const [userInteract, setUserInteract] = useState<boolean>(false);
    const userInteractRef = useRef<boolean>();
    userInteractRef.current = userInteract;
    initialRenderRef.current = initialRender;
    selectedTutorialRef.current = selectedTutorial;

    const [lastOnChangeStep, setLastOnChangeStep] = useState<number>(0);
    const lastOnChangeStepRef = useRef<number>();
    lastOnChangeStepRef.current = lastOnChangeStep;

    const [refreshCounter, setRefreshCounter] = useState<number>(0);
    const refreshCounterRef = useRef<number>();
    refreshCounterRef.current = refreshCounter;

    const getTutorialObjectForPage = (page: string) => {
        switch (page) {
            case 'auctions':
                return { lsKey: 'tuto_auctions', steps: futaAuctionsSteps };
            case 'auctionCreate':
                return { lsKey: 'tuto_futa_create', steps: futaCreateSteps };
            default:
                return undefined;
        }
    };

    const validateURL = () => {
        return (
            getTutorialObjectForPage(currentPage) &&
            getTutorialObjectForPage(currentPage)?.lsKey ==
                selectedTutorialRef.current?.lsKey
        );
    };

    const assignSelectedTuto = () => {
        console.log(
            'tuto assigning for ',
            currentPage,
            ' ------------------------------------------------------------------------------',
        );
        if (currentPage && getTutorialObjectForPage(currentPage)) {
            setSelectedTutorial(getTutorialObjectForPage(currentPage));
            selectedTutorialRef.current = getTutorialObjectForPage(currentPage);
        } else {
            setSelectedTutorial(undefined);
        }
    };

    const handleShowState = async (filteredSteps: Step[]) => {
        if (
            selectedTutorialRef.current &&
            selectedTutorialRef.current.lsKey ==
                getTutorialObjectForPage(currentPage)?.lsKey
        ) {
            const lsVal = getLS(selectedTutorialRef.current.lsKey);

            if (checkStepHash) {
                const currentStepsHash =
                    await generateObjectHash(filteredSteps);
                if (lsVal != currentStepsHash) {
                    console.log(lsVal);
                    console.log(currentStepsHash);
                    console.log('check diff  .ç. . . . ... ');
                }
                return lsVal != currentStepsHash;
            } else {
                return !lsVal;
            }
        } else {
            return false;
        }
    };

    const handleTutoFinish = async () => {
        let lsValue = '';
        if (selectedTutorialRef.current) {
            if (checkStepHash) {
                lsValue = await generateObjectHash(
                    selectedTutorialRef.current?.steps,
                );
            } else {
                lsValue = new Date().toISOString();
            }
            if (
                filterRenderedSteps().length > 0 &&
                selectedTutorialRef.current
            ) {
                setLS(selectedTutorialRef.current.lsKey, lsValue);
            }
        }

        setShowTutorial(false);
    };

    const filterRenderedSteps = () => {
        const filteredSteps: Step[] = [];

        if (selectedTutorialRef.current && selectedTutorialRef.current.steps) {
            const steps = selectedTutorialRef.current.steps;

            if (steps instanceof Array) {
                steps.map((e) => {
                    const el = document.querySelectorAll(e.element as string);
                    if (el.length > 0) {
                        filteredSteps.push(e);
                    }
                });
            }
        }

        return filteredSteps;
    };

    const handleTutoBuild = async () => {
        console.log('tuto build', selectedTutorialRef.current?.lsKey);
        const filteredSteps = filterRenderedSteps();
        if (filteredSteps.length > 0) {
            const showTutos = await handleShowState(filteredSteps);
            setShowTutorial(showTutos);
        }
    };

    useEffect(() => {
        console.log('>>>>>>>>>>>>> initial timeout func', styles);
        assignSelectedTuto();

        document.addEventListener('click', () => {
            // setUserInteract(true);
            // userInteractRef.current = true;
        });
    }, []);

    useEffect(() => {
        assignSelectedTuto();
    }, [currentPage]);

    useEffect(() => {
        // setTimeout(() => {
        handleTutoBuild();
        // }, 2000)
        setInitialRender(true);
        // initialRenderRef.current = true;
        setUserInteract(false);
        setShowCustomOverlay(true);
        // userInteractRef.current = false;
        // console.log('initialRender', initialRenderRef.current, 'userInteract', userInteractRef.current)
    }, [selectedTutorial]);

    // useEffect(() => {
    //     assignSelectedTuto();
    // }, [userInteract == false])

    const [showCustomOverlay, setShowCustomOverlay] = useState<boolean>(true);
    const showCustomOverlayRef = useRef<boolean>();
    showCustomOverlayRef.current = showCustomOverlay;

    // const outsideClickListener = () => {
    //     // setUserInteract(true);
    //     // setShowTutorial(false);
    //     // setShowCustomOverlay(false);
    //     // setInitialRender(false);
    //     console.log('<<<<<<<<<<<< outside click >>>>>>>')
    // }

    const forceRefresh = () => {
        if (refreshCounterRef.current) {
            setRefreshCounter(refreshCounterRef.current + 1);
        } else {
            setRefreshCounter(refreshCounter + 1);
        }
    };

    domDebug('userInteract', userInteract);
    domDebug('userInteractRef', userInteractRef.current);
    domDebug('initialRender', initialRender);
    domDebug('initialRenderRef', initialRenderRef.current);
    domDebug('showCustomOverlay', showCustomOverlayRef.current);
    domDebug('showTutorial', showTutorial);
    domDebug('refreshCounter', refreshCounterRef.current);
    domDebug(
        'showw condition',
        validateURL() &&
            selectedTutorialRef.current &&
            filterRenderedSteps().length > 0 &&
            initialRenderRef.current &&
            showTutorial,
    );

    return (
        <>
            {validateURL() &&
                selectedTutorialRef.current &&
                filterRenderedSteps().length > 0 &&
                initialRenderRef.current &&
                showTutorial && (
                    <>
                        <Steps
                            key={selectedTutorialRef.current.lsKey}
                            enabled={showTutorial}
                            // steps={filterRenderedSteps()}
                            steps={selectedTutorialRef.current.steps}
                            initialStep={0}
                            // onChange={(nextStepIndex, nextElement) => {console.log('nextStepIndex', nextStepIndex); console.log('nextElement', nextElement, '---------------------------------'); filterRenderedSteps()}}
                            onComplete={() => handleTutoFinish()}
                            onExit={(step) => {
                                console.log(
                                    'onExit',
                                    'step',
                                    step,
                                    'showTutorial',
                                    showTutorial,
                                    'initialRender',
                                    initialRenderRef.current,
                                    'userInteract',
                                    userInteractRef.current,
                                );
                                if (
                                    filterRenderedSteps().length > 0 &&
                                    initialRenderRef.current &&
                                    userInteractRef.current
                                ) {
                                    setInitialRender(false);
                                }
                                // if(step == -1){
                                //     console.log('exit with click')
                                //     setUserInteract(false);
                                // }
                            }}
                            onStart={() => {
                                console.log('onStart');
                            }}
                            // onChange={ (nextStep) => {console.log('nextStep ------------------', nextStep); if(nextStep> 0 ) {setUserInteract(true)}}}
                            // onChange={ (nextStep, nextElement) => {console.log('nextStep ------------------', nextStep, ' next element', nextElement); setUserInteract(true)}}
                            onChange={(nextStep) => {
                                console.log('onChange..........', nextStep);
                                if (nextStep == lastOnChangeStepRef.current) {
                                    setTimeout(() => {
                                        forceRefresh();
                                    }, 500);
                                }
                                setLastOnChangeStep(nextStep);
                            }}
                            options={{
                                showStepNumbers: true,
                            }}
                            // onAfterChange={(newStepIndex) => {console.log('onAfterChange', newStepIndex)}}
                        />
                        {/* {!userInteractRef.current && (<div className={styles.custom_overlay} onClick={outsideClickListener}></div>)} */}
                    </>
                )}

            <DomDebugger />
        </>
    );
}

export default memo(TutorialOverlayUrlDetect);
