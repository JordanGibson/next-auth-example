export default function styler(element: HTMLElement | string) {
    function getElements(): HTMLElement[] {
        if (element instanceof HTMLElement) {
            return [element];
        } else if (typeof element === 'string') {
            return Array.from(document.querySelectorAll(element)) as HTMLElement[];
        }

        return [];
    }

    return {
        get(styles: string[]) {
            if (!Array.isArray(styles)) {
                throw new Error('Second parameter of this function should be an array');
            }

            const elems = getElements();

            if (elems.length === 0) {
                return false;
            }

            const elem = elems[0];

            const obj: { [key: string]: string } = {};

            if (elem instanceof HTMLElement && styles) {
                styles.map(style => (obj[style] = window.getComputedStyle(elem, null).getPropertyValue(style)));
                return obj;
            }
        }
    };
}
