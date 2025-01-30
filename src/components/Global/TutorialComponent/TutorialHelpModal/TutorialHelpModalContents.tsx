import styles from './TutorialHelpModalContents.module.css';

export const AuctionHelpModal = () => {
    const steps = [
        'You create a ticker',
        'For 24h, everyone gets to buy in *at the same price*',
        'After 24h, the ticker launches',
        '"Launch" means a pool is created on Ambient where people can trade the ticker freely',
    ];

    return (
        <>
            <div className={styles.tuto_content_wrapper}>
                <span>FUTA is the fairest way to create memecoins.</span>
                <span>
                    We call them tickers around here, and it works something
                    like this:
                </span>
                <div className={styles.tuto_content_text_steps}>
                    {steps.map((step, index) => (
                        <span key={index}>
                            {index + 1}. {step}
                        </span>
                    ))}
                </div>
                <span>
                    No devs needed. No presale jeeted. And everyone gets in at
                    the same price.
                </span>
                <span>Are you ready, anon?</span>
            </div>
        </>
    );
};

export const ChatHelpModal = () => {
    return <div>ChatHelpModal</div>;
};
