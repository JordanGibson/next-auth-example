import React from 'react';
import Suites from '../../pages/suites';
import { Endpoints } from '../../pages/api/_endpoints';
import { Fixtures } from '../../cypress/fixtures/_fixtures';
import { IndexedSuitesResponseType } from '../../pages/api/suite/indexed';
import {toast} from "react-toastify";

describe('suites component', () => {
    beforeEach(() => {
        cy.intercept(Endpoints.latestBuildsForSuite('**'), {
            fixture: 'api/suite/summary/example-details',
        }).as('getSummary');

        cy.intercept(Endpoints.indexedSuites, { fixture: Fixtures.indexedSuites }).as('getIndexed');
    });

    it('should show stats when successfully loaded component', () => {
        mountComponent();

        cy.get('.spinner').should('not.exist');
        cy.get('#suite-title').should('be.visible');

        cy.wait('@getSummary');

        cy.get('#prod-double-failure-stat > .stat > .stat-value').should('be.visible');
        cy.get('#preview-double-failure-stat > .stat > .stat-value').should('be.visible');
    });

    it('should fail to load component when indexed request fails', () => {
        cy.intercept(Endpoints.indexedSuites, { forceNetworkError: true }).as('getIndexed');

        mountComponent();

        cy.contains('failed to load');
    });

    describe('favourite', () => {
        beforeEach(() => {
            cy.intercept(Endpoints.favouriteSuite, {}).as('favouriteSuite');
        });

        it('should set suite as favourite if user clicks favourite button and currently unfavourited', () => {
            mountComponent();

            cy.fixture(Fixtures.indexedSuites).then((suites: IndexedSuitesResponseType) => {
                suites[0].isFavourite = true;
                cy.intercept(Endpoints.indexedSuites, suites).as('getIndexedWithFavourite');
            });

            cy.get('[data-testid="StarBorderOutlinedIcon"]').should('be.visible');

            cy.get('#Smart_WebSystemTests_Others-favouriteButton').click();

            cy.wait('@favouriteSuite').its('request.body').should('deep.equal', {
                suite: 'Smart_WebSystemTests_Others',
                isFavourite: true,
            });

            cy.wait('@getIndexedWithFavourite');

            cy.get('[data-testid="StarIcon"]').should('be.visible');
        });

        it('should unfavourite suite if user clicks favourite button and currently favourited', () => {
            cy.fixture(Fixtures.indexedSuites).then((suites: IndexedSuitesResponseType) => {
                suites[0].isFavourite = true;
                cy.intercept(Endpoints.indexedSuites, suites).as('getIndexed');
            });

            mountComponent();

            cy.get('[data-testid="StarIcon"]').should('be.visible');

            cy.intercept(Endpoints.indexedSuites, { fixture: Fixtures.indexedSuites }).as(
                'getIndexed'
            );

            cy.get('#Smart_WebSystemTests_Others-favouriteButton').click();

            cy.wait('@favouriteSuite').its('request.body').should('deep.equal', {
                suite: 'Smart_WebSystemTests_Others',
                isFavourite: false,
            });

            cy.wait('@getIndexed');

            cy.get('[data-testid="StarBorderOutlinedIcon"]').should('be.visible');
        });

        it.only('should display an error toast when it fails to update favourites', () => {
            mountComponent();

            cy.intercept(Endpoints.favouriteSuite, { forceNetworkError: true }).as(
                'favouriteSuite'
            );

            cy.get('#Smart_WebSystemTests_Others-favouriteButton').click();
        });
    });

    function mountComponent() {
        cy.mount(<Suites />);

        cy.get('.spinner').should('be.visible');
        cy.get('#suite-title').should('not.exist');

        cy.wait('@getIndexed');

        toast("Test")
    }
});
