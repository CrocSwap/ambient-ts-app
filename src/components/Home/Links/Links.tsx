import styles from './Links.module.css';

interface LinkCardProps {
    title: string;
    body: string | number;
}
export default function Links() {
    function LinkCard(props: LinkCardProps) {
        const { title, body } = props;
        return (
            <div className={styles.link_card_container}>
                <div className={styles.title}>{title}</div>
                <div className={styles.body}>{body}</div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <div className={styles.column}>
                    <LinkCard title='Terms of Use' body='Our rules for using the platform' />
                    <LinkCard title='Privacy Policy' body='View our policies around data' />
                </div>
                <div className={styles.column}>
                    <LinkCard title='Tutorials' body='Learn Ambient Finance' />
                    <LinkCard title='Competition' body='Trading competition rules' />
                </div>
                <div className={styles.column}>
                    <LinkCard title='Docs' body='View our documentation' />
                    <LinkCard title='Github' body='View our smart contracts, SDK, and more' />
                </div>
                <div className={styles.column}>
                    <LinkCard title='Twitter' body='Keep up with the latest on twitter' />
                    <LinkCard title='Discord' body='Join the community' />
                    <LinkCard title='Medium' body='Read the latest from our team on medium' />
                </div>
            </div>
        </div>
    );
}
