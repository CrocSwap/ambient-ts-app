import { CORPORATE_LINK } from '../../constants';
import { footerItemIF } from './Footer';
import styles from './Footer.module.css';

interface propsIF {
    data: footerItemIF;
}

// propsIF conforms to the shape of data defined in the file `Footer.tsx`
export default function FooterItem(props: propsIF) {
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
