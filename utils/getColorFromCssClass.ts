import styler from "./styler";

export function getBgColorFromCssClass(cssClass: string): string {
    // @ts-ignore
    return styler(`.${cssClass}`).get(['background-color'])['background-color'];
}

export function getColorFromCssClass(cssClass: string): string {
    // @ts-ignore
    return styler(`.${cssClass}`).get(['color'])['color'];
}

export default function getColor(cssClass: string): string {
    return getBgColorFromCssClass(cssClass) ?? getColorFromCssClass(cssClass);
}

