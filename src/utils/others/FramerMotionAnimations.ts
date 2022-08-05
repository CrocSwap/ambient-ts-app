// This animation is for any component that has to render other components. Great for things such as Accordion, dropdowns, etc.. Add this to the main container that is the parent component of the rendered items.
export const dropdownAnimation = {
    hidden: {
        opacity: 0,
        height: 0,
        padding: 0,
        transition: { duration: 0.3, when: 'afterChildren' },
    },
    show: {
        opacity: 1,
        height: 'auto',
        transition: {
            duration: 0.3,
            when: 'beforeChildren',
        },
    },
};

// This is animation for individual items. Great for any items that are being mapped over. It will render in the items one by one. Pass this animation to the map items. This animation uses the index for the animation and each animation renders in differently depending on their index.
export const ItemEnterAnimation = {
    hidden: (i: number) => ({
        padding: 0,
        x: '-100%',
        transition: {
            duration: (i + 1) * 0.1,
        },
    }),
    show: (i: number) => ({
        x: 0,
        transition: {
            duration: (i + 1) * 0.1,
        },
    }),
};

// Similar to menu animation, this renders an animation from an opacity of 0 to an opacity of 1. Great for rendering loading items.
export const showAnimation = {
    hidden: {
        width: 0,
        opacity: 0,
        transition: {
            duration: 0.5,
        },
    },
    show: {
        opacity: 1,
        width: 'auto',
        transition: {
            duration: 0.5,
        },
    },
};
