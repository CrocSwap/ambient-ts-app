import { Step } from 'intro.js-react';
import 'intro.js/introjs.css';
import { memo, useEffect, useRef, useState } from 'react';
import { useLinkGen } from '../../../utils/hooks/useLinkGen';
import { futaAuctionsSteps } from '../../../utils/tutorial/Futa/AuctionsSteps';
import { futaCreateSteps } from '../../../utils/tutorial/Futa/FutaCreateSteps';
import { TutorialIF } from '../../Chat/ChatIFs';
import { generateObjectHash, getLS, setLS } from '../../Chat/ChatUtils';
import TutorialComponent from '../TutorialComponent/TutorialComponent';
// import { MdOutlineArrowForwardIos, MdOutlineArrowBackIos, MdClose} from 'react-icons/md'

interface TutorialOverlayPropsIF {
    checkStepHash?: boolean;
}
function TutorialOverlayUrlDetect2(props: TutorialOverlayPropsIF) {
    const { checkStepHash } = props;

    const [showTutorial, setShowTutorial] = useState<boolean>(false);

    const { currentPage } = useLinkGen();
    const [selectedTutorial, setSelectedTutorial] = useState<
        TutorialIF | undefined
    >();
    const selectedTutorialRef = useRef<TutorialIF | undefined>();
    selectedTutorialRef.current = selectedTutorial;
    const [isTutoBuild, setIsTutoBuild] = useState<boolean>(false);
    const [stepsFiltered, setStepsFiltered] = useState<Step[]>([]);

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
        if (currentPage && getTutorialObjectForPage(currentPage)) {
            setSelectedTutorial(getTutorialObjectForPage(currentPage));
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
                    console.log(handleTutoFinish);
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
            if (stepsFiltered.length > 0 && selectedTutorialRef.current) {
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
        console.log('filteredSteps', filteredSteps);

        return filteredSteps;
    };

    const handleTutoBuild = async () => {
        const filteredSteps = filterRenderedSteps();
        if (filteredSteps.length > 0) {
            const showTutos = await handleShowState(filteredSteps);
            setShowTutorial(showTutos);
            setStepsFiltered(filteredSteps);
        }
        setIsTutoBuild(true);
    };

    useEffect(() => {
        setTimeout(() => {
            assignSelectedTuto();
        }, 1000);
    }, []);

    useEffect(() => {
        assignSelectedTuto();
        setIsTutoBuild(false);
    }, [currentPage]);

    useEffect(() => {
        handleTutoBuild();
    }, [selectedTutorial]);

    return (
        <>
            {validateURL() &&
                selectedTutorialRef.current &&
                stepsFiltered.length > 0 &&
                showTutorial &&
                isTutoBuild && (
                    <>
                        {/* <Steps
                        key={selectedTutorialRef.current.lsKey}
                        enabled={showTutorial}
                        steps={filterRenderedSteps()}
                        initialStep={0}
                        // onChange={(nextStepIndex, nextElement) => {console.log('nextStepIndex', nextStepIndex); console.log('nextElement', nextElement, '---------------------------------'); filterRenderedSteps()}}
                        onComplete={() => handleTutoFinish()}
                        onExit={() => {
                            console.log('finish', showTutorial); 
                            if(filterRenderedSteps().length > 0 && initialRenderRef.current && userInteractRef.current){
                                setInitialRender(false);
                            } 
                        }}
                        onStart={ () => {console.log('starttttttttttttttttttttttttttttt')}}
                        onChange={ () => {setUserInteract(true)}}
                        options={{
                            showStepNumbers: true,
                        }}
                    /> */}
                        <TutorialComponent
                            key={selectedTutorialRef.current.lsKey}
                            tutoKey={selectedTutorialRef.current.lsKey}
                            steps={filterRenderedSteps()}
                            showSteps={true}
                        />
                    </>
                )}
        </>
    );
}

export default memo(TutorialOverlayUrlDetect2);
