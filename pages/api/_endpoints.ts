const api = '/api';

export const Endpoints = {
    suite: api + '/suite',
    indexedSuites: api + '/suite/indexed',
    favouriteSuite: api + '/suite/favourite',
    userTheme: api + '/user/theme',
    latestBuildsForSuite: (suiteId: string) => api + '/suite/latest/' + suiteId,
}