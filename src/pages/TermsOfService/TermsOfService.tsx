import styles from './TermsOfService.module.css';

export default function TermsOfService() {
    const firstSection = (
        <section className={styles.tos_section}>
            <h3 className={styles.tos_section_heading}>First Section</h3>
            <p className={styles.tos_section_paragraph}>
                Bacon ipsum dolor amet filet mignon ball tip leberkas shoulder landjaeger rump.
                Burgdoggen ribeye turducken flank pork chop pancetta kielbasa shankle sausage. Cow
                doner sirloin tri-tip pig meatball shoulder ribeye short ribs alcatra buffalo
                chislic rump pork. Prosciutto pastrami bacon ham hock cow. Leberkas drumstick
                t-bone, turkey shankle porchetta ball tip pork doner landjaeger.
            </p>
            <p className={styles.tos_section_paragraph}>
                Pancetta ball tip kevin, frankfurter sausage jerky brisket landjaeger pork chop
                capicola buffalo. Doner filet mignon venison, corned beef jowl tenderloin tail.
                Frankfurter flank landjaeger pork loin t-bone sirloin. Leberkas chislic shankle
                turkey filet mignon kielbasa chuck jerky.
            </p>
            <p className={styles.tos_section_paragraph}>
                Shank pork belly beef ribs ground round tongue boudin tail doner alcatra venison.
                Beef venison leberkas jerky pastrami filet mignon fatback kevin sausage ham hock
                chuck burgdoggen. Cupim bacon frankfurter sirloin cow pastrami salami chicken, jerky
                hamburger beef pork belly picanha. Cupim chicken tri-tip, fatback shoulder
                frankfurter swine doner pastrami sausage. Spare ribs meatball shank landjaeger.
                Landjaeger andouille cow, leberkas ribeye buffalo meatloaf ball tip. Picanha buffalo
                chislic sausage hamburger pancetta tri-tip flank short ribs kielbasa andouille spare
                ribs ham shankle turkey.
            </p>
        </section>
    );

    const secondSection = (
        <section className={styles.tos_section}>
            <h3 className={styles.tos_section_heading}>Second Section</h3>
            <p className={styles.tos_section_paragraph}>
                Spicy jalapeno bacon ipsum dolor amet short loin beef pig hamburger venison. Strip
                steak ground round burgdoggen, chicken venison filet mignon landjaeger hamburger
                frankfurter porchetta pastrami. Prosciutto hamburger pastrami salami, ribeye
                bresaola cupim beef ham kielbasa short loin tongue pancetta capicola pork chop.
                Brisket chuck corned beef tri-tip prosciutto. Cupim tenderloin pork filet mignon
                turducken brisket. Tail pork chop ball tip alcatra pork ribeye salami chuck.
            </p>
            <p className={styles.tos_section_paragraph}>
                Tri-tip spare ribs pork pig ground round filet mignon, beef ribs kevin. Swine
                meatloaf filet mignon ground round tri-tip flank. Spare ribs ground round
                frankfurter drumstick, ball tip short loin pork loin jerky. Kevin cupim turkey shank
                landjaeger tail jowl sausage pastrami pork belly meatloaf sirloin boudin tenderloin.
            </p>
            <p className={styles.tos_section_paragraph}>
                Cupim drumstick tenderloin ham hock chuck meatloaf. Kielbasa shoulder rump
                andouille. Boudin alcatra bacon kevin picanha. Filet mignon shoulder ham chicken
                andouille picanha cupim cow beef biltong. Short ribs pork chop venison kevin,
                tri-tip cupim meatloaf salami strip steak. Jowl bacon leberkas burgdoggen porchetta
                frankfurter jerky, pancetta pork shank ball tip andouille.
            </p>
        </section>
    );

    return (
        <section>
            <h1 className={styles.tos_title}>Terms of Service</h1>
            {firstSection}
            {secondSection}
        </section>
    );
}
