import { RadarRelay } from '@radarrelay/sdk';
import { updateBalancesAndTableAsync } from './balances';

/**
 * Watch the active address. Update the balances
 * and address in the UI id changed
 */
export function watchActiveAddress(rr: RadarRelay) {
  const web3 = (window as any).web3;
  rr.account.address = web3.eth.accounts[0];
  $('#active-address').text(rr.account.address);

  setInterval(async function() {
    if (web3.eth.accounts[0] !== rr.account.address) {
      rr.account.address = web3.eth.accounts[0];
      $('#active-address').text(rr.account.address);

      // Show Loader
      $('.loader').show();

      // Update balances
      await updateBalancesAndTableAsync(rr);

      // Hide Loader
      $('.loader').hide();
    }
  }, 100);
}
