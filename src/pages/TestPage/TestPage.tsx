import { styled } from 'styled-components/macro';
import MultiStepTransaction, {
    TransactionStep,
} from '../../components/Global/MultiStepTransaction/MultiStepTransaction';

const StepContainer = styled.div`
    height: 400px;
    width: 800px;
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
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Sint
                reprehenderit hic sunt quae labore ullam esse ex ut officia
                voluptate provident perspiciatis ipsa laborum quos, odio
                exercitationem pariatur adipisci! Impedit.
            </StepContainer>
        );
    };

    const Step2 = () => {
        return (
            <StepContainer>
                <h2>Step 2</h2>
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Quis
                earum illum omnis rerum nostrum libero tempore, eos, dolorum
                magnam ullam, atque animi cupiditate. Amet dolorum ipsum itaque
                dolores blanditiis saepe, cum optio commodi ipsa rem, labore in
                doloribus ratione praesentium aperiam, similique sapiente
                expedita quaerat maxime aspernatur excepturi? Numquam,
                laboriosam.
            </StepContainer>
        );
    };

    const Step3 = () => {
        return (
            <StepContainer>
                <h2>Step 3</h2>
                Lorem ipsum dolor, sit amet consectetur adipisicing elit. Magni
                itaque molestias tempore accusantium. Ab, recusandae at
                molestiae dolor possimus perferendis.
            </StepContainer>
        );
    };

    // Define steps array
    const steps: TransactionStep[] = [
        { component: Step1 },
        { component: Step2 },
        { component: Step3 },
    ];

    return (
        <section>
            <h1>Multi-Step Transaction Example</h1>
            <MultiStepTransaction steps={steps} />
        </section>
    );
}
