import { Steps, Step } from 'intro.js-react';
import 'intro.js/introjs.css';
import { useState, useEffect } from 'react';
import { generateObjectHash, getLS, setLS } from '../../Chat/ChatUtils';
// import { MdOutlineArrowForwardIos, MdOutlineArrowBackIos, MdClose} from 'react-icons/md'

interface TutorialOverlayPropsIF {
    lsKey: string;
    // eslint-disable-next-line
    steps: any;
    checkStepHash?: boolean; // when used step hash, tutorial component will check dom filtered steps and will triggered if steps are changed with last shown step set
}
export default function TutorialOverlayLS(props: TutorialOverlayPropsIF) {
    const { lsKey, steps, checkStepHash } = props;

    const [stepsFiltered, setStepsFiltered] = useState<Step[]>([]);
    const [showTutorial, setShowTutorial] = useState<boolean>(false);

    const handleShowState = async (filteredSteps: Step[]) => {
        const lsVal = getLS(lsKey);

        if (checkStepHash) {
            const currentStepsHash = await generateObjectHash(filteredSteps);
            if (lsVal != currentStepsHash) {
                console.log(lsVal);
                console.log(currentStepsHash);
                console.log('check diff  .ç. . . . ... ');
            }
            return lsVal != currentStepsHash;
        } else {
            return !lsVal;
        }
    };

    const handleTutoFinish = async () => {
        let lsValue = '';
        if (checkStepHash) {
            lsValue = await generateObjectHash(stepsFiltered);
        } else {
            lsValue = new Date().toISOString();
        }

        if (stepsFiltered.length > 0) {
            setLS(lsKey, lsValue);
        }

        setShowTutorial(false);
    };

    const filterRenderedSteps = () => {
        const filteredSteps: Step[] = [];

        if (steps instanceof Array) {
            steps.map((e) => {
                const el = document.querySelectorAll(e.element);
                if (el.length > 0) {
                    filteredSteps.push(e);
                }
            });
        }
        return filteredSteps;
    };

    const handleTutoBuild = async () => {
        const filteredSteps = filterRenderedSteps();
        if (filteredSteps.length > 0) {
            const showTutos = await handleShowState(filteredSteps);
            setShowTutorial(showTutos);
            setStepsFiltered(filteredSteps);
        }
    };

    useEffect(() => {
        setTimeout(() => {
            handleTutoBuild();
        }, 2000);
    }, []);

    console.log(stepsFiltered);

    return (
        <>
            {stepsFiltered.length > 0 && (
                <>
                    <Steps
                        enabled={showTutorial}
                        steps={stepsFiltered}
                        initialStep={0}
                        // onChange={(nextStepIndex, nextElement) => {console.log('nextStepIndex', nextStepIndex); console.log('nextElement', nextElement, '---------------------------------'); filterRenderedSteps()}}
                        onComplete={() => handleTutoFinish()}
                        onExit={() => {
                            console.log('finish');
                        }}
                        options={{
                            showStepNumbers: true,
                        }}
                    />
                </>
            )}
        </>
    );
}
