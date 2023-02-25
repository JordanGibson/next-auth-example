import { IndexedSuite, IndexedSuitesResponseType } from '../api/suite/indexed';
import { PutFavouriteSuiteRequestType } from '../api/suite/favourite';
import { Endpoints } from '../api/_endpoints';
import { toast } from 'react-toastify';
import axios from 'axios';

export async function putFavouriteSuite(suites: IndexedSuitesResponseType, suite: IndexedSuite) {
    const body: PutFavouriteSuiteRequestType = {
        suite: suite.id,
        isFavourite: !suite.isFavourite,
    };
    const result = await axios.put(Endpoints.favouriteSuite, body).catch(err => {
        console.log(err);
        toast.error('An error occurred while updating favourites');
    });
    if (result?.status != 200) return suites;
    return toggleFavourite(suites, suite);
}

export function toggleFavourite(
    suites: IndexedSuitesResponseType,
    suite: IndexedSuite
): IndexedSuite[] {
    return suites!.map(x =>
        x.id === suite.id ? { ...suite, isFavourite: !suite.isFavourite } : x
    );
}
