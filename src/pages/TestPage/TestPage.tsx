import React, { useState } from 'react';
import NewNetworkSelector from '../../App/components/PageHeader/NetworkSelector/NewNetworkSelector';
import { useTermsOfService } from '../../App/hooks/useTermsOfService';
import Accordion from '../../components/Global/Accordion/Accordion';
import ConfirmationModalControl from '../../components/Global/ConfirmationModalControl/ConfirmationModalControl';
import { MenuButton } from '../../components/Global/MenuButton/MenuButton';
import TransactionAccordions from '../../components/Trade/TradeTabs/Transactions/TransactionAccordions/TransactionAccordions';
import styles from './TestPage.module.css';
// import { useAppDispatch, useAppSelector } from '../../utils/hooks/reduxToolkit';
// import { useProcessTransaction } from '../../utils/hooks/useProcessTransaction';

interface TestPageProps {
    openGlobalModal: (content: React.ReactNode, title?: string) => void;
}
export default function TestPage(props: TestPageProps) {
    const [isOpen, setOpen] = React.useState(false);
    // const graphData = useAppSelector((state) => state.graphData);

    // const changesByPool = graphData?.changesByPool?.changes;
    // const JrTx = changesByPool[0]

    // const txData =  useProcessTransaction(JrTx)

    // console.log(txData?.ownerId)

    const { openGlobalModal } = props;
    const { tosText, agreement, agreementDate } = useTermsOfService();

    const exampleTest = (
        <div className={styles.example_container}>
            <h1>Please work</h1>
            <p>
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Vitae perspiciatis
                veritatis necessitatibus quam eius ipsum illo cupiditate nobis dignissimos delectus
                quae quibusdam quas ratione ducimus laborum odio dolorum nesciunt, a natus provident
                vero quo voluptates dolore. Modi culpa id velit ipsa cumque corporis aut, aperiam,
                harum incidunt illo, repellat dolor blanditiis cum vitae perspiciatis eaque non quia
                quae. Porro vero odit dolorum at quae soluta atque, excepturi quod id, odio,
                repudiandae pariatur ipsum maiores? Minima nam sed ex nihil nostrum modi fuga nisi
                animi autem blanditiis iure a repudiandae voluptatibus eveniet odit, doloremque
                temporibus est incidunt molestias ratione ut. Reprehenderit!
            </p>
        </div>
    );

    const menuButtonStyle = {
        marginLeft: '2rem',
    };
    const accordionIds = [0, 1, 2, 3];
    const [expanded, setExpanded] = useState<false | number>(0);

    return (
        <main className={styles.main}>
            <h1>Hi there!</h1>
            <p>{tosText}</p>
            <p>
                You {agreement ? 'accepted' : 'rejected'} the Terms of Service on {agreementDate}
            </p>
            {/* <button onClick={() => acceptToS()}>Agree to ToS</button>
            <button onClick={() => rejectToS()}>Reject ToS</button> */}
            <button onClick={() => openGlobalModal(exampleTest, 'this is title')}>
                Test Modal
            </button>
            I am here
            <MenuButton
                isOpen={isOpen}
                onClick={() => setOpen(!isOpen)}
                style={menuButtonStyle}
                width={24}
                height={24}
            />
            <MenuButton
                isOpen={isOpen}
                onClick={() => setOpen(!isOpen)}
                strokeWidth='4'
                color='#7371fc'
                transition={{ ease: 'easeOut', duration: 0.2 }}
                width='34'
                height='24'
                style={menuButtonStyle}
            />
            <NewNetworkSelector />
            <ConfirmationModalControl />
            {accordionIds.map((item, idx) => (
                <Accordion id={item} key={item}>
                    I am accordion
                </Accordion>
            ))}
            {accordionIds.map((item, idx) => (
                <TransactionAccordions
                    key={item}
                    i={item}
                    expanded={false}
                    setExpanded={'something'}
                />
            ))}
            <h1>TRANSACTION ACCORDIONS</h1>
            {accordionIds.map((accordion, idx) => (
                <TransactionAccordions
                    i={accordion}
                    expanded={expanded}
                    setExpanded={setExpanded}
                    key={idx}
                />
            ))}
        </main>
    );
}
