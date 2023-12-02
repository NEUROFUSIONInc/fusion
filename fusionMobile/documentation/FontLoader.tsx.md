
# Font Loader (`FontLoader.tsx`)

## Prelude to Typography

In an application where appearance is not an afterthought, `FontLoader.tsx` stands as the valiant custodian of typographical elegance. This noble script ensures that the visual prose of our UI is rendered with the font families befitting its status.

## The Art of Font Conjuration

The `FontLoader` component does not merely load fonts; it performs a meticulous ballet of asynchronous asset management, wrapping its children in a warm embrace only when the font families have fully graced us with their presence.

### The Props of Destiny

- **`onFontsLoaded`**: A callback, as mystical as ancient runes, to be invoked when the fonts have shouldered their responsibilities successfully.
- **`children`**: The vulnerable offspring of `FontLoader`, awaiting the font banquet to begin.

```javascript
interface Props extends PropsWithChildren {
  onFontsLoaded?: () => void; // callback for displaying the splash screen once background view has loaded
}
```

### The Loading Rite

Within the belly of the component, `useFonts` is called upon to summon the font files from the ethereal realms of `"./assets/fonts/"`. These are no mere typefaces; they are the font lords:

- `wsh-thin`
- `wsh-light`
- `wsh-reg`
- `wsh-med`
- `wsh-semi`
- `wsh-bold`
- `wsh-xbold`

Each, with a weighty presence, demands to be retrieved and honed before displayed.

### The Transitional Prestidigitation

The `onLayoutRootView` spell is prepared, though currently entombed in comments, to dispel the splash screen—much like a magician revealing the final act. Once the fonts load, the grand stage is set for the UI's performance (cue: dramatic orchestral beat).

```javascript
const onLayoutRootView = useCallback(async () => {
  // if (fontsLoaded) {
  //   await SplashScreen.hideAsync(); //hide the splashscreen
  // }
}, [fontsLoaded, onFontsLoaded]);
```

### The Rendering Loom

Should the fonts tarry, `FontLoader` shall not pass, returning an empty `View`. But once the font lords arrive, the `children` are not just displayed—they are exalted upon a `View` with a protective padding of `insets.top`, ensuring they never dare encroach upon the sacred status bar.

```javascript
if (!fontsLoaded) {
  return <View />;
}

return (
  <View
    style={{
      paddingTop: insets.top,
      flex: 1,
    }}
    onLayout={onLayoutRootView}
  >
    {children}
  </View>
);
```

## The Chronicle's Conclusion

Thus, dear reader, should you gaze upon `FontLoader.tsx`, know that it is no humble tool. It is the gatekeeper to textual refinement, the arbiter of Android and iOS typographic harmony. For in the realm of pixels and points, fonts are not merely chosen—they are heralded like kings and queens returning to their digital thrones.

Let thy screens always wear their letters with pride, and may every glyph be as polished as the wit of the developer who orchestrated this chorus of typefaces.

Happy rendering!
