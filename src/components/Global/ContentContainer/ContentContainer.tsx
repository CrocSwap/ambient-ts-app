import styles from 'ContentContainer.module.css';

interface ContentContainerProps {
    children: React.ReactNode;
    customWidth: boolean;
    customWidthAuto: boolean;
}

export default function ContentContainer(props: ContentContainerProps) {
    const { customWidth, customWidthAuto } = props;

    const customWidthStyle = customWidth ? styles.customWidth_container : null;
    const customWidthAutoStyle = customWidthAuto ? styles.customWidthAuto : styles.container;

    return (
        <main className={`$ ${customWidthStyle} ${customWidthAutoStyle}`}>
            <section className={`${styles.window} `}>
                <div className={styles.main_content}>{props.children}</div>
            </section>
        </main>
    );
}
