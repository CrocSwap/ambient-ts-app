import { useRef } from 'react';
import styles from './Create.module.css';
import CreateField, { CreateFieldPropsIF } from './CreateField';

export default function Create() {
    const tickerStr = useRef<string>('');
    const nameStr = useRef<string>('');
    const descriptionStr = useRef<string>('');
    const twitterStr = useRef<string>('');
    const telegramStr = useRef<string>('');
    const websiteStr = useRef<string>('');

    const inputs: CreateFieldPropsIF[] = [
        {
            inputId: 'ticker_input',
            label: 'Token Ticker',
            charLimit: 14,
            updateRef: (s: string) => (tickerStr.current = s),
            rows: 1,
        },
        {
            inputId: 'token_name_input',
            label: 'Token Name',
            charLimit: 30,
            updateRef: (s: string) => (nameStr.current = s),
            rows: 1,
        },
        {
            inputId: 'description_input',
            label: 'Description',
            charLimit: 280,
            updateRef: (s: string) => (descriptionStr.current = s),
            rows: 8,
        },
        {
            inputId: 'twitter_url_input',
            label: 'Twitter Link',
            charLimit: 1000,
            updateRef: (s: string) => (twitterStr.current = s),
            rows: 1,
        },
        {
            inputId: 'telegram_url_input',
            label: 'Telegram Link',
            charLimit: 1000,
            updateRef: (s: string) => (telegramStr.current = s),
            rows: 1,
        },
        {
            inputId: 'website_url_input',
            label: 'Website Link',
            charLimit: 1000,
            updateRef: (s: string) => (websiteStr.current = s),
            rows: 1,
        },
    ];

    return (
        <section className={styles.create}>
            <h2>{'<'}</h2>
            <form className={styles.create_form}>
                <div className={styles.form_left}></div>
                <div className={styles.form_right}>
                    {inputs.map((inp: CreateFieldPropsIF) => (
                        <CreateField key={JSON.stringify(inp)} {...inp} />
                    ))}
                </div>
            </form>
            <button onClick={() => console.log(tickerStr.current)}>
                Check
            </button>
        </section>
    );
}
