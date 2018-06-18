import { SdkManager, InjectedWalletType, EventName } from '@radarrelay/sdk';
import { updateTokensAndTableAsync } from './tokens';
import { watchActiveAddress } from './account';
import { populateTokenDropdowns } from './trade';
import { Sdk } from './Sdk';
import { promisify } from 'es6-promisify';

export default class Main {

  // Selectors
  private readonly loaderSelector = '.loader';
  private readonly networkWarningSelector = '#network-warning';

  /**
   * Initialize the Radar Relay SDK
   */
  public async initializeSdkAsync(): Promise<void> {
    try {
      // Instantiate the sdk
      Sdk.Instance = SdkManager.Setup({
        type: InjectedWalletType.Metmask,
        sdkInitializationTimeoutMs: 30000
      });

      // Populate UI on ethereum, account, and markets initialized
      this.addInitializedListeners();

      // Initialize the sdk with the injected wallet params
      await SdkManager.InitializeAsync(Sdk.Instance);
    } catch (err) {
      console.log(err);
    }
  }

  /**
   * Add ethereum, account, and markets event listeners
   */
  private addInitializedListeners() {
    // Poll for network id on ethereum initialized
    Sdk.Instance.events.on(EventName.EthereumInitialized, async () => {
      let previousNetworkId: number;

      previousNetworkId = await this.updateNetworkIdBannerAsync(previousNetworkId);
      setInterval(async () => {
        previousNetworkId = await this.updateNetworkIdBannerAsync(previousNetworkId);
      }, 5000);
    });

    // Update tokens and table on account initialized
    Sdk.Instance.events.on(EventName.AccountInitialized, async () => {
      // Update balances
      await updateTokensAndTableAsync();

      watchActiveAddress();
    });

    // Populate token dropdowns on markets initialized
    Sdk.Instance.events.on(EventName.MarketsInitialized, async () => {
      // Populate Token Dropdowns
      populateTokenDropdowns();

      // Hide Loader
      $(this.loaderSelector).hide();
    });
  }

  /**
   * Update network banner visibility based on active network.
   * @param previousNetworkId The previous network id
   */
  private async updateNetworkIdBannerAsync(previousNetworkId: number) {
    try {
      const networkId = Number(await promisify(Sdk.Instance.web3.version.getNetwork)());
      if (networkId !== previousNetworkId) {
        previousNetworkId = networkId;

        if (networkId === 42) {
          $(this.networkWarningSelector).addClass('d-none');
        } else {
          $(this.networkWarningSelector).removeClass('d-none');
        }
      }
      return previousNetworkId;
    } catch (err) {
      console.log(err);
    }
  }
}
