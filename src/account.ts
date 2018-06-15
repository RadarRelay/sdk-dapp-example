import { updateTokensAndTableAsync } from './tokens';
import { Sdk } from './Sdk';
import { EventName } from '@radarrelay/sdk';

// Selectors
const activeAddressSelector = '#active-address';
const loaderSelector = '.loader';


/**
 * Watch the active address. Update the balances
 * and address in the UI id changed
 */
export function watchActiveAddress() {
  // Set address in UI
  $(activeAddressSelector).text(Sdk.Instance.account.address);

  Sdk.Instance.events.on(EventName.AddressChanged, async (address: string) => {
    $(activeAddressSelector).text(address || 'None');

    // Show Loader
    $(loaderSelector).show();

    // Update balances and allowances
    await updateTokensAndTableAsync();

    // Hide Loader
    $(loaderSelector).hide();
  });
}
