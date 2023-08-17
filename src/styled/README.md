## Styled Components 

The purpose of styled components is to create components with their associated styles by promoting a more modular and organized way of handling styles in your application.
It also allows for the reuse of generic or prevalent styles throught the app. These styled components are found under `src/styled/Common.ts`. 
Component specific styled components should use the generic styles as building blocks and only modify as necessary and located under `src/styled/<component>`. 
Component specific styled components should also be generically named and postfixed with the HTMLElement type where applicable.

### Example: 
Using Common Components:
```
const ContentContainer = styled(Container)`
    // reusing generic components
    {Font}
    {Color}

    // component specific css
    cursor: pointer;
`;

const Content = () => {
    //...

    return 
    <ContentContainer display='grid' numCols=3 gap='8px' color='accent1' backgroundColor='dark1'>
        <Container display='flex' flexDirection='column' padding='s'>
            <Text fontSize='header1'>I am the head.</Text>
            <Text fontSize='body'>I am the body,</Text>
        </Container>
    </ContentContainer>
}
```
