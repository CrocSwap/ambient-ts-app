# Introduction

This directory contains code to create tooltips in the Ambient app and data to fill out the tooltip skeleton.

The tooltip component makes use of a component from MaterialUi. `Tooltip`.
To read more on the component, see the official docs: 
Tooltip : https://mui.com/material-ui/react-tooltip/


# Location and Files

* This directory is located at `/src/components/TooltipComponent/TooltipComponent`
* `TooltipComponent.tsx` contains:
    * JSX for the tooltip skeleton
    * code to handle optional `<title>` and `<placement>` elements
* `TooltipComponent.component.css` is a CSS component which holds styling for the tooltip skeleton.

# Developer Notes

To call a Tooltip anywhere in the app, you should:
1. Import the React functional component from `TooltipComponent.tsx`
2. Render the tooltip component with a `title` attribute, which is the text the tooltip displays when a user hovers.
3. The tooltip component optionally takes a `placement` prop, which is where the title of the tooltip will be displayed, relative to it's container.
 - Some options for the placements are 
        | 'right'
        | 'bottom-end'
        | 'bottom-start'
        | 'bottom'
        | 'left-end'
        | 'left-start'
        | 'left'
        | 'right-end'
        | 'right-start'
        | 'top-end'
        | 'top-start'
        | 'top'
- The default placement is on the right.

Full example of usablity:
` <TooltipComponent title='Snackbar title' placement='right />`

To open the tooltip component, simply hover over the question svg that comes with the tooltip component.





