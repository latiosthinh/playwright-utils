/**
 * Playwright helpers module
 * Requires @playwright/test as peer dependency
 */

// Page helpers
export {
  PageHelpers,
  createPageHelpers,
  BREAKPOINTS,
} from './page-helpers';

// Locator helpers
export {
  buildLocator,
  combineLocators,
  filterVisibleLocators,
  escapeSelector,
  buildTextSelector,
  buildRoleSelector,
  buildTestIdSelector,
  buildAriaLabelSelector,
  buildIdSelector,
  buildClassSelector,
  buildAttributeSelector,
  buildNthChildSelector,
  buildNthOfTypeSelector,
  buildFirstChildSelector,
  buildLastChildSelector,
  buildVisibleSelector,
  buildContainsTextSelector,
  buildHasChildSelector,
  LocatorBuilder,
  createLocatorBuilder,
  suggestSelector,
} from './locator-helpers';

// Wait helpers
export {
  WaitHelpers,
  createWaitHelpers,
  poll,
  retry,
} from './wait-helpers';

// Scroll helpers
export {
  ScrollHelpers,
  createScrollHelpers,
} from './scroll-helpers';

// Network helpers
export {
  NetworkHelpers,
  createNetworkHelpers,
  ApiClient,
  createApiClient,
} from './network-helpers';

// Viewport helpers
export {
  ViewportHelpers,
  createViewportHelpers,
  VIEWPORTS,
  BREAKPOINTS as VIEWPORT_BREAKPOINTS,
  getViewport,
  getMobileViewports,
  getTabletViewports,
  getDesktopViewports,
} from './viewport-helpers';

export type { ViewportName, BreakpointName } from './viewport-helpers';

