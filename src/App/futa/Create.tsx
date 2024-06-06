import styles from './Create.module.css';

export default function Create() {
    // const token = useRef({
    //     ticker: '',
    //     name: '',
    //     description: '',
    //     twitter: '',
    //     telegram: '',
    //     website: '',
    // });

    // function takeInput(k: keyof typeof token.current, payload: string) {
    //     token.current[k] = payload;
    // }

    // const inputs: CreateFieldPropsIF[] = [
    //     {
    //         inputId: 'ticker_input',
    //         label: 'Token Ticker',
    //         charLimit: 14,
    //         updateRef: (s: string) => takeInput('ticker', s),
    //         rows: 1,
    //     },
    //     {
    //         inputId: 'token_name_input',
    //         label: 'Token Name',
    //         charLimit: 30,
    //         updateRef: (s: string) => takeInput('name', s),
    //         rows: 1,
    //     },
    //     {
    //         inputId: 'description_input',
    //         label: 'Description',
    //         charLimit: 280,
    //         updateRef: (s: string) => takeInput('description', s),
    //         rows: 8,
    //     },
    //     {
    //         inputId: 'twitter_url_input',
    //         label: 'Twitter Link',
    //         updateRef: (s: string) => takeInput('twitter', s),
    //         rows: 1,
    //     },
    //     {
    //         inputId: 'telegram_url_input',
    //         label: 'Telegram Link',
    //         updateRef: (s: string) => takeInput('telegram', s),
    //         rows: 1,
    //     },
    //     {
    //         inputId: 'website_url_input',
    //         label: 'Website Link',
    //         updateRef: (s: string) => takeInput('website', s),
    //         rows: 1,
    //     },
    // ];

    return (
        <section className={styles.create_token}>
            <button
                className={styles.create_button}
                onClick={() => console.log('clicked Create Token')}
            >
                Create Token
            </button>
        </section>
    );
}
