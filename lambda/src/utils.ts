export function stripFailedFromClassName(name: string) {
    return name.replace(RegExp(".*?: (.*)"), "$1");
}