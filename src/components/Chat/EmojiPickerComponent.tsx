import React, { useEffect } from 'react';

interface EmojiPickerComponentProps {
    activeCategory: string;
    setActiveCategory: (category: string) => void;
}

const EmojiPickerComponent: React.FC<EmojiPickerComponentProps> = ({
    activeCategory,
    setActiveCategory,
}) => {
    // Define the handleClick function outside of useEffect to use it in the JSX
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        const selectedCategory = event.currentTarget.getAttribute(
            'data-name',
        ) as string;
        setActiveCategory(selectedCategory);
    };

    useEffect(() => {
        const buttons = document.querySelectorAll('.emoji-categories button');

        buttons.forEach((button) => {
            button.classList.remove('active');
            if (button.getAttribute('data-name') === activeCategory) {
                button.classList.add('active');
            }
        });

        return () => {
            buttons.forEach((button) => {
                // eslint-disable-next-line
                button.removeEventListener('click', handleClick as any);
            });
        };
    }, [activeCategory]);

    return (
        <nav className='emoji-categories'>
            <button
                type='button'
                className='icn-smileys_people'
                data-name='smileys_people'
                aria-label='smileys/people'
                onClick={handleClick}
            >
                😊
            </button>
            <button
                type='button'
                className='icn-animals_nature'
                data-name='animals_nature'
                aria-label='animals/nature'
                onClick={handleClick}
            >
                🐻
            </button>
            <button
                type='button'
                className='icn-food_drink'
                data-name='food_drink'
                aria-label='food/drink'
                onClick={handleClick}
            >
                🍎
            </button>
            <button
                type='button'
                className='icn-travel_places'
                data-name='travel_places'
                aria-label='travel/places'
                onClick={handleClick}
            >
                🏝️
            </button>
            <button
                type='button'
                className='icn-activities'
                data-name='activities'
                aria-label='activities'
                onClick={handleClick}
            >
                ⚽
            </button>
            <button
                type='button'
                className='icn-objects'
                data-name='objects'
                aria-label='objects'
                onClick={handleClick}
            >
                📱
            </button>
            <button
                type='button'
                className='icn-symbols'
                data-name='symbols'
                aria-label='symbols'
                onClick={handleClick}
            >
                ❤️
            </button>
            <button
                type='button'
                className='icn-flags'
                data-name='flags'
                aria-label='flags'
                onClick={handleClick}
            >
                🏳️
            </button>
        </nav>
    );
};

export default EmojiPickerComponent;
