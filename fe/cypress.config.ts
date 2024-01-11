import { defineConfig } from "cypress";
import vitePreprocessor from "cypress-vite";

/**********************************************************************************/

export default defineConfig({
  viewportWidth: 1920,
  viewportHeight: 1080,
  chromeWebSecurity: false,
  userAgent: 'cypress',
  e2e: {
    baseUrl: `${process.env.CLIENT_URL}/${process.env.CLIENT_PORT}`,
    setupNodeEvents(on) {
      on(
        "file:preprocessor",
        vitePreprocessor(),
      );
    },
    experimentalRunAllSpecs: true,
    specPattern: "./cypress/e2e/**/*.cy.ts",
    supportFile: "./cypress/support/e2e.ts",
  },
});
