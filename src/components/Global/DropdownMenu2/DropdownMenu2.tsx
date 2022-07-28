import styles from './DropdownMenu2.module.css';
import { useState } from 'react';
import { FaAngleDown } from 'react-icons/fa';
import { AnimatePresence, motion } from 'framer-motion';
import { dropdownAnimation } from '../../../utils/others/FramerMotionAnimations';
interface DropdownMenuProps {
    title: string;
    children: React.ReactNode;
    marginTop?: string;
    titleWidth?: string;
    titleBackground?: string;
}
export default function DropdownMenu2(props: DropdownMenuProps) {
    const { title, children, marginTop, titleWidth, titleBackground } = props;
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    let isIconOpen = true;
    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
        isIconOpen = false;
    };

    const dropdownMenuContent = (
        <AnimatePresence>
            {isMenuOpen && (
                <motion.div
                    variants={dropdownAnimation}
                    initial='hidden'
                    animate='show'
                    exit='hidden'
                    className={styles.menu_container}
                    style={{ top: marginTop ? marginTop : '30px' }}
                >
                    {/* {route.map((subRoute, i) => (
              <motion.div variants={menuItemAnimation} key={i} custom={i}>
                  <div className={styles.icon}>{'icon'}</div>
                  <motion.div className={styles.link_text}>{'name'}</motion.div>
              </motion.div>
            ))} */}
                    {children}
                </motion.div>
            )}
        </AnimatePresence>
    );

    return (
        <>
            <div
                className={styles.menu}
                onClick={toggleMenu}
                style={{
                    minWidth: titleWidth ? titleWidth : '100px',
                    background: titleBackground ? titleBackground : 'transparent',
                }}
            >
                <div className={styles.menu_item}>
                    <div className={styles.icon}>{title}</div>
                    {/* <AnimatePresence>
            {isMenuOpen&& (
              <motion.div
                variants={showAnimation}
                initial="hidden"
                animate="show"
                exit="hidden"
                className={styles.link_text}
              >
              {title}
              </motion.div>
            )}
          </AnimatePresence> */}
                </div>
                {isIconOpen && (
                    <motion.div
                        animate={
                            isMenuOpen
                                ? {
                                      rotate: -90,
                                  }
                                : { rotate: 0 }
                        }
                    >
                        <FaAngleDown />
                    </motion.div>
                )}
            </div>
            {dropdownMenuContent}
        </>
    );
}
