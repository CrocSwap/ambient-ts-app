import { useState } from 'react';
import { FlexContainer } from '../../styled/Common';
import StepperComponent from '../../components/Global/MultiStepTransaction/StepperComponent';

export default function TestPage() {
    const [activeStep, setActiveStep] = useState(0);
    // For demonstration-------------------------------
    const questions = [
        { text: 'What is 2 + 2?', answer: 4 },
        { text: 'What is 5 + 3?', answer: 8 },
        { text: 'What is 10 + 10?', answer: 20 },
    ];

    const [activeQuestion, setActiveQuestion] = useState(0);
    const [userAnswer, setUserAnswer] = useState('');
    const [isError, setIsError] = useState(false);

    const handleAnswer = () => {
        const parsedAnswer = parseInt(userAnswer, 10);
        if (
            !isNaN(parsedAnswer) &&
            parsedAnswer === questions[activeQuestion].answer
        ) {
            if (activeQuestion === questions.length - 1) {
                setActiveQuestion(0);
                setActiveStep(0);
            } else {
                setActiveQuestion(
                    (prevActiveQuestion) => prevActiveQuestion + 1,
                );
                setActiveStep((prevActiveStep) => prevActiveStep + 1);
                setIsError(false);
            }
            setUserAnswer('');
        } else {
            setIsError(true);
        }
    };

    const questionContent = (
        <div>
            <p>{questions[activeQuestion].text}</p>
            <input
                type='number'
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
            />
            <button onClick={handleAnswer}>Submit Answer</button>

            <div>
                <p>Active Step: {activeStep}</p>
            </div>
        </div>
    );

    // ENd of for demonstration--------------------

    return (
        <FlexContainer flexDirection='row' justifyContent='space-around'>
            {questionContent}

            <StepperComponent
                orientation='vertical'
                steps={[
                    { label: 'Question 1' },
                    { label: 'Question 2' },
                    { label: 'Question 3' },
                ]}
                activeStep={activeStep}
                setActiveStep={setActiveStep}
                isError={isError}
            />
        </FlexContainer>
    );
}
