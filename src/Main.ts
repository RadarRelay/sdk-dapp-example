import { SdkManager } from '@radarrelay/sdk';
import { InjectedWalletType } from '@radarrelay/sdk/dist/types';
import { updateTokensAndTableAsync } from './tokens';
import { watchActiveAddress } from './account';
import { populateTokenDropdowns } from './trade';
import { Sdk } from './Sdk';

export default class Main {

  // Selectors
  private readonly loaderSelector = '.loader';

  /**
   * Initialize the Radar Relay SDK
   */
  public async initializeSdkAsync(): Promise<void> {
    try {
      // Instantiate the sdk
      Sdk.Instance = SdkManager.Setup({
        endpoint: '',
        websocketEndpoint: '',
        sdkInitializationTimeoutMs: 30000
      },
        {
          type: InjectedWalletType.Metmask
        }
      );

      // Start Polling once the account is initialized
      this.initializeBalancesAndAccountPolling();

      // Initialize the sdk with the injected wallet params
      await SdkManager.InitializeAsync(Sdk.Instance);
    } catch (err) {
      console.log(err);
    }
  }

  /**
   * Initialize balance and account polling
   * @param rr The sdk instance
   */
  initializeBalancesAndAccountPolling() {
    Sdk.Instance.events.on('accountInitialized', async () => {
      // Update balances
      await updateTokensAndTableAsync();

      // Populate Token Dropdowns
      populateTokenDropdowns();

      // Hide Loader
      $(this.loaderSelector).hide();

      watchActiveAddress();
    });
  }
}
