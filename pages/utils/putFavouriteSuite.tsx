import { IndexedSuite, IndexedSuitesResponseType } from '../api/suite/indexed';
import { PutFavouriteSuiteRequestType } from '../api/suite/favourite';
import { Endpoints } from '../api/_endpoints';
import { toast } from 'react-toastify';

export async function putFavouriteSuite(suites: IndexedSuitesResponseType, suite: IndexedSuite) {
    const body: PutFavouriteSuiteRequestType = {
        suite: suite.id,
        isFavourite: !suite.isFavourite,
    };
    const result = await fetch(Endpoints.favouriteSuite, {
        method: 'PUT',
        body: JSON.stringify(body),
        headers: {
            'Content-Type': 'application/json',
        },
    });
    if (result.ok) {
        return toggleFavourite(suites, suite);
    }
    toast.error('An error occurred while updating favourites');
    return suites;
}

export function toggleFavourite(
    suites: IndexedSuitesResponseType,
    suite: IndexedSuite
): IndexedSuite[] {
    return suites!.map(x =>
        x.id === suite.id ? { ...suite, isFavourite: !suite.isFavourite } : x
    );
}
