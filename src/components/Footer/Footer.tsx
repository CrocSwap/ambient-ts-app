import { useMediaQuery } from '@mui/material';
import styles from './Footer.module.css';
import { BsGithub, BsTwitter, BsMedium } from 'react-icons/bs';
import { FaDiscord } from 'react-icons/fa';
import { IoDocumentTextSharp } from 'react-icons/io5';
import { RiSpyFill } from 'react-icons/ri';
import { SiGitbook } from 'react-icons/si';

import { Link } from 'react-router-dom';
import {
    DISCORD_LINK,
    DOCS_LINK,
    GITHUB_LINK,
    IS_LOCAL_ENV,
    MEDIUM_LINK,
    TWITTER_LINK,
} from '../../constants';
import { useTermsAgreed } from '../../App/hooks/useTermsAgreed';
import FooterCard from './FooterCard';

export interface footerItemIF {
    title: JSX.Element;
    content: string;
    link: string;
}

export default function Footer() {
    const [, , termsUrls] = useTermsAgreed();

    // raw data to generate cards in the footer
    const footerData: footerItemIF[] = [
        {
            title: (
                <>
                    <IoDocumentTextSharp size={15} /> Terms of Service
                </>
            ),
            content: 'Our rules for using the platform',
            link: `${window.location.origin}/${termsUrls.tos}`,
        },
        {
            title: (
                <>
                    <RiSpyFill size={15} /> Privacy Policy
                </>
            ),
            content: 'View our policies around data',
            link: `${window.location.origin}/${termsUrls.privacy}`,
        },
        {
            title: (
                <>
                    <SiGitbook size={15} /> Docs
                </>
            ),
            content: 'View our documentation',
            link: DOCS_LINK,
        },
        {
            title: (
                <>
                    <BsGithub size={15} /> GitHub
                </>
            ),
            content: 'View our smart contracts, SDK, and more',
            link: GITHUB_LINK,
        },
        {
            title: (
                <>
                    <BsTwitter size={15} /> Twitter
                </>
            ),
            content: 'Keep up with the latest on twitter',
            link: TWITTER_LINK,
        },
        {
            title: (
                <>
                    <FaDiscord size={15} /> Discord
                </>
            ),
            content: 'Join the community ',
            link: DISCORD_LINK,
        },
        {
            title: (
                <>
                    <BsMedium size={15} /> Medium
                </>
            ),
            content: 'Read the latest from our team on Medium',
            link: MEDIUM_LINK,
        },
    ];

    // how many items from `footerData to display in each column
    // each element denotes a column, value is how many elements to populate
    // changing the number of values changes the number of columns
    const itemsPerColumn: [number, number, number] = [2, 2, 3];

    // warn developer if more items are defined in `footerData` than are
    // ... being rendered in the DOM for the user
    if (IS_LOCAL_ENV) {
        const numToShow: number = itemsPerColumn.reduce((a, c) => a + c);
        numToShow < footerData.length &&
            console.warn(
                `The Footer.tsx file defines <<${footerData.length}>> items but only designates <<${numToShow}>> to be rendered in the DOM`,
            );
    }

    // transform `footerData` into an array of arrays to ease columnization
    const columnizedData: Array<footerItemIF[]> = itemsPerColumn.map(
        (count: number, idx: number): footerItemIF[] => {
            // index in `footerData` to stop slice
            const sliceEnd: number = itemsPerColumn
                .slice(0, idx + 1)
                .reduce(
                    (accumulator: number, currentValue: number) =>
                        accumulator + currentValue,
                );
            // index in `footerData` to begin slice
            const sliceStart: number = sliceEnd - count;
            // return sub-array from `footerData` with proper elements
            return footerData.slice(sliceStart, sliceEnd);
        },
    );

    // boolean to trigger early return for mobile version of the app
    const showMobileVersion: boolean = useMediaQuery('(max-width: 600px)');

    // early return for mobile version
    if (showMobileVersion) {
        return (
            <footer className={styles.mobile_version}>
                {footerData.map((card: footerItemIF) => (
                    <FooterCard key={card.link} data={card} />
                ))}
                <Link
                    to={'/trade'}
                    tabIndex={0}
                    aria-label='Go to trade page button'
                    className={styles.started_button}
                >
                    Trade Now
                </Link>
            </footer>
        );
    }

    // main return for non-movile version
    return (
        <footer className={styles.content}>
            {
                // map over `columnizedData` to create columns
                columnizedData.map(
                    (columnData: footerItemIF[], idx: number) => (
                        <div className={styles.row} key={idx}>
                            {
                                // map over data in column to make cards
                                columnData.map((card: footerItemIF) => (
                                    <FooterCard key={card.link} data={card} />
                                ))
                            }
                        </div>
                    ),
                )
            }
        </footer>
    );
}
