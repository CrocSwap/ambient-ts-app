## Styled Components 

The purpose of styled components is to create components with their associated styles by promoting a more modular and organized way of handling styles in your application.
It also allows for the reuse of generic or prevalent styles throught the app. These styled components are found under `src/styled/Common.ts`. 
Component specific styled components should use the generic styles as building blocks and only modify as necessary and located under `src/styled/<component>`. 

### Example: 
Using Common Components:
```
const LabelContainer = styled(GridContainer)`
    // reusing generic components
    {FontSize}

    // component specific css
    cursor: pointer;
`;
```
