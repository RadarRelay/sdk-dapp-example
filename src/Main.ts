import { RadarRelay } from '@radarrelay/sdk';
import { InjectedWalletType } from '@radarrelay/sdk/dist/types';
import { updateBalancesAndTableAsync } from './balances';
import { watchActiveAddress } from './account';

export default class Main {

  /**
   * Initialize the Radar Relay SDK
   */
  public async initializeSdkAsync(): Promise<RadarRelay> {
    try {
      // Instantiate the sdk
      const rr = new RadarRelay({
        endpoint: 'https://api-beta.rrdev.io/v0',
        websocketEndpoint: 'wss://api-beta.rrdev.io/ws',
        sdkInitializationTimeout: 30000
      });

      // Start Polling once the account is initialized
      this.initializeBalancesAndAccountPolling(rr);

      // Initialize the sdk with the injected wallet params
      await rr.initialize({
        type: InjectedWalletType.Metmask,
        web3: (window as any).web3,
        dataRpcUrl: 'https://kovan.infura.io'
      });

      return rr;
    } catch (err) {
      console.log(err);
    }
  }

  /**
   * Initialize balance and account polling
   * @param rr The sdk instance
   */
  initializeBalancesAndAccountPolling(rr: RadarRelay) {
    rr.events.on('accountInitialized', async () => {
      // Update balances
      await updateBalancesAndTableAsync(rr);

      // Hide Loader
      $('.loader').hide();

      watchActiveAddress(rr);
  });
  }
}
