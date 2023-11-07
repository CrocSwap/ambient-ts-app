import { CORPORATE_LINK } from '../../constants';
import { footerItemIF } from './Footer';
import styles from './Footer.module.css';

interface propsIF {
    data: footerItemIF;
}

// future Emily this is past Emily, you're going to wonder why you broke this
// ... code out into its own component file, the reason is that even though
// ... there's no logic the component itself is instantiated in muliple places

// propsIF conforms to the shape of data defined in the file `Footer.tsx`
export default function FooterCard(props: propsIF) {
    const { data } = props;
    return (
        <a
            href={data.link}
            className={styles.footer_item_container}
            target='_blank'
            rel={data.link === CORPORATE_LINK ? 'noreferrer me' : 'noreferrer'}
        >
            <h3>{data.title}</h3>
            <p>{data.content}</p>
        </a>
    );
}
