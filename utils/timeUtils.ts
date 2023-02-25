import moment from 'moment';

export function formatDate(date: Date | undefined): string {
    return moment(date).fromNow();
}

export function formatDuration(elapsedTime: number | undefined, shortForm: boolean = false) {
    const duration = moment.duration(elapsedTime, 'milliseconds');
    // Format the duration with or without hours, depending on whether it has hours
    const hours = Math.floor(duration.asHours());
    const minutes = Math.floor(duration.asMinutes() - hours * 60);
    const seconds = Math.floor(duration.asSeconds() - minutes * 60);
    let result = '';
    if (hours > 0) result += `${hours} ${toShortForm('hours', shortForm)} `;
    if (minutes > 0) result += `${minutes} ${toShortForm('minutes', shortForm)} `;
    if (!hours && seconds > 0) result += `${seconds} ${toShortForm('seconds', shortForm)} `;

    if (result == '') result = '< 1ms';

    return result;
}

function toShortForm(value: string, shortForm: boolean) {
    return shortForm ? value[0] : value;
}
