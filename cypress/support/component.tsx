// ***********************************************************
// This example support/component.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'
import './main.css'

// Alternatively you can use CommonJS syntax:
// require('./commands')

import { mount } from 'cypress/react18'
import component from "recharts/demo/component";
import Suites from "../../pages/suites";
import {SWRConfig} from "swr";
import React from "react";
import {MountOptions, MountReturn} from "cypress/react";

// Augment the Cypress namespace to include type definitions for
// your custom command.
// Alternatively, can be defined in cypress/support/component.d.ts
// with a <reference path="./component" /> at the top of your spec.
declare global {
  namespace Cypress {
    interface Chainable {
      mount(
          component: React.ReactNode,
          options?: MountOptions
      ): Cypress.Chainable<MountReturn>
    }
  }
}

Cypress.Commands.add('mount', (component, options = {}) => {
  const wrapped = <SWRConfig value={{provider: () => new Map() }}><Suites /></SWRConfig>;
  return mount(wrapped, options);
})

// Example use:
// cy.mount(<MyComponent />)