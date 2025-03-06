import ThaleahFatFont from './assets/ui/ThaleahFat.ttf';

export const loadFonts = () => {
    const font = new FontFace('ThaleahFat', `url(${ThaleahFatFont})`);
    return font.load().then((loadedFont) => {
        document.fonts.add(loadedFont);
        return loadedFont;
    });
}; 