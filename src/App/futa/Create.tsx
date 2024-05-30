import { useRef } from 'react';
import styles from './Create.module.css';
import CreateField, { CreateFieldPropsIF } from './CreateField';

export default function Create() {
    const token = useRef({
        ticker: '',
        name: '',
        description: '',
        twitter: '',
        telegram: '',
        website: '',
    });

    function takeInput(k: keyof typeof token.current, payload: string) {
        token.current[k] = payload;
    }

    const inputs: CreateFieldPropsIF[] = [
        {
            inputId: 'ticker_input',
            label: 'Token Ticker',
            charLimit: 14,
            updateRef: (s: string) => takeInput('ticker', s),
            rows: 1,
        },
        {
            inputId: 'token_name_input',
            label: 'Token Name',
            charLimit: 30,
            updateRef: (s: string) => takeInput('name', s),
            rows: 1,
        },
        {
            inputId: 'description_input',
            label: 'Description',
            charLimit: 280,
            updateRef: (s: string) => takeInput('description', s),
            rows: 8,
        },
        {
            inputId: 'twitter_url_input',
            label: 'Twitter Link',
            charLimit: 1000,
            updateRef: (s: string) => takeInput('twitter', s),
            rows: 1,
        },
        {
            inputId: 'telegram_url_input',
            label: 'Telegram Link',
            charLimit: 1000,
            updateRef: (s: string) => takeInput('telegram', s),
            rows: 1,
        },
        {
            inputId: 'website_url_input',
            label: 'Website Link',
            charLimit: 1000,
            updateRef: (s: string) => takeInput('website', s),
            rows: 1,
        },
    ];

    return (
        <section className={styles.create}>
            <h2 className={styles.go_back}>{'<'}</h2>
            <form className={styles.create_form}>
                <div className={styles.form_left}></div>
                <div className={styles.form_right}>
                    {inputs.map((inp: CreateFieldPropsIF) => (
                        <CreateField key={JSON.stringify(inp)} {...inp} />
                    ))}
                </div>
            </form>
            <button onClick={() => console.log(token.current)}>Check</button>
        </section>
    );
}
