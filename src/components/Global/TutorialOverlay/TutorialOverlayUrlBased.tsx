import { Step } from 'intro.js-react';
import { memo, useContext, useEffect, useRef, useState } from 'react';
import { useLinkGen } from '../../../utils/hooks/useLinkGen';
import { futaAuctionsSteps } from '../../../utils/tutorial/Futa/AuctionsSteps';
import { futaCreateSteps } from '../../../utils/tutorial/Futa/FutaCreateSteps';
import { TutorialIF } from '../../Chat/ChatIFs';
import { generateObjectHash, getLS, setLS } from '../../Chat/ChatUtils';
import TutorialComponent from '../TutorialComponent/TutorialComponent';
import styles from './TutorialOverlayUrlBased.module.css';
import { AiOutlineQuestionCircle } from 'react-icons/ai';
import { UserDataContext } from '../../../contexts/UserDataContext';
// import { MdOutlineArrowForwardIos, MdOutlineArrowBackIos, MdClose} from 'react-icons/md'

interface TutorialOverlayPropsIF {
    checkStepHash?: boolean;
}
function TutorialOverlayUrlBased(props: TutorialOverlayPropsIF) {
    const { isUserConnected } = useContext(UserDataContext);

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

    const [replayTutorial, setReplayTutorial] = useState<boolean>(false);

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
        setReplayTutorial(false);
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
        setReplayTutorial(false);
    }, [selectedTutorial]);

    const replayBtnListener = () => {
        setReplayTutorial(true);
    };

    const shouldTutoComponentShown =
        validateURL() &&
        stepsFiltered.length > 0 &&
        showTutorial &&
        isTutoBuild;

    return (
        <>
            {(shouldTutoComponentShown || replayTutorial) &&
                selectedTutorialRef.current && (
                    <>
                        <TutorialComponent
                            key={selectedTutorialRef.current.lsKey}
                            tutoKey={selectedTutorialRef.current.lsKey}
                            steps={filterRenderedSteps()}
                            showSteps={true}
                            onComplete={handleTutoFinish}
                            initialTimeout={600}
                        />
                    </>
                )}

            {!shouldTutoComponentShown && (
                <div
                    className={`${styles.replay_tuto_btn} ${!isUserConnected ? styles.not_connected : ' '}`}
                    onClick={replayBtnListener}
                >
                    {' '}
                    <AiOutlineQuestionCircle />
                </div>
            )}
            {/* {(<div className={`${styles.replay_tuto_btn} ${!isUserConnected ? styles.not_connected  : ' ' }`} onClick={replayBtnListener}> <AiOutlineQuestionCircle /></div>)} */}
        </>
    );
}

export default memo(TutorialOverlayUrlBased);
