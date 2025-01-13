import { Step } from 'intro.js-react';
import {
    Dispatch,
    memo,
    SetStateAction,
    useContext,
    useEffect,
    useRef,
    useState,
} from 'react';
import { AppStateContext } from '../../../contexts/AppStateContext';
import { useFutaHomeContext } from '../../../contexts/Futa/FutaHomeContext';
import { useLinkGen } from '../../../utils/hooks/useLinkGen';
import { futaAuctionsSteps } from '../../../utils/tutorial/Futa/AuctionsSteps';
import { futaAccountSteps } from '../../../utils/tutorial/Futa/FutaAccountSteps';
import { futaCreateSteps } from '../../../utils/tutorial/Futa/FutaCreateSteps';
import { TutorialIF, TutorialStepExternalComponent } from '../../Chat/ChatIFs';
import { generateObjectHash, getLS, setLS } from '../../Chat/ChatUtils';
import TutorialComponent from '../TutorialComponent/TutorialComponent';
import styles from './TutorialOverlayUrlBased.module.css';
import { ambientMarketSteps } from '../../../utils/tutorial/MarketSteps';
// import{ MdOutlineArrowForwardIos, MdOutlineArrowBackIos, MdClose} from 'react-icons/md'

interface TutorialOverlayPropsIF {
    replayTutorial: boolean;
    setReplayTutorial: Dispatch<SetStateAction<boolean>>;
    tutorialBtnRef: React.RefObject<HTMLDivElement>;
    checkStepHash?: boolean;
}
function TutorialOverlayUrlBased(props: TutorialOverlayPropsIF) {
    const { checkStepHash, replayTutorial, setReplayTutorial, tutorialBtnRef } =
        props;

    const { currentPage } = useLinkGen();
    const [selectedTutorial, setSelectedTutorial] = useState<
        TutorialIF | undefined
    >();
    const selectedTutorialRef = useRef<TutorialIF | undefined>();
    selectedTutorialRef.current = selectedTutorial;
    const [isTutoBuild, setIsTutoBuild] = useState<boolean>(false);
    const [stepsFiltered, setStepsFiltered] = useState<Step[]>([]);

    const [showTutorial, setShowTutorial] = useState<boolean>(false);

    const {
        walletModal: { open: openWalletModal },
    } = useContext(AppStateContext);

    const { showTutosLocalStorage } = useFutaHomeContext();

    const connectButton = (
        <button
            id='connect_wallet_button_page_header'
            onClick={openWalletModal}
            className={styles.connectButton}
        >
            CONNECT WALLET
        </button>
    );

    const getTutorialObjectForPage = (page: string) => {
        console.log('>>> page : ', page);
        switch (page) {
            case 'auctions':
                return { lsKey: 'tuto_auctions', steps: futaAuctionsSteps };
            case 'account':
                return {
                    lsKey: 'tuto_futa_account',
                    steps: futaAccountSteps,
                    disableDefault: true,
                };
            case 'auctionCreate':
                return {
                    lsKey: 'tuto_futa_create',
                    steps: futaCreateSteps,
                    externalComponents: new Map<
                        string,
                        TutorialStepExternalComponent
                    >([
                        [
                            '#auctions_create_connect_button',
                            { component: connectButton, placement: 'nav-end' },
                        ],
                    ]),
                };
            case 'market':
                return { lsKey: 'tuto_market', steps: ambientMarketSteps };
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

    const shouldTutoComponentShown =
        validateURL() &&
        stepsFiltered.length > 0 &&
        showTutorial &&
        isTutoBuild &&
        selectedTutorialRef.current &&
        !selectedTutorialRef.current.disableDefault &&
        showTutosLocalStorage;

    if (!shouldTutoComponentShown && filterRenderedSteps().length > 0) {
        if (tutorialBtnRef.current?.style) {
            tutorialBtnRef.current.style.display = 'flex';
        }
    } else {
        if (tutorialBtnRef.current?.style) {
            tutorialBtnRef.current.style.display = 'none';
        }
    }

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
                            externalComponents={
                                selectedTutorialRef.current.externalComponents
                            }
                        />
                    </>
                )}
        </>
    );
}

export default memo(TutorialOverlayUrlBased);
