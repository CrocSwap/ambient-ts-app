import { CORPORATE_LINK } from '../../constants';
import { footerItemIF as propsIF } from './Footer';
import styles from './Footer.module.css';

// propsIF conforms to the shape of data defined in the file `Footer.tsx`
export default function FooterItem(props: propsIF) {
    const { title, content, link } = props;
    return (
        <a
            href={link}
            className={styles.footer_item_container}
            target='_blank'
            rel={link === CORPORATE_LINK ? 'noreferrer me' : 'noreferrer'}
        >
            <h3>{title}</h3>
            <p>{content}</p>
        </a>
    );
}
