import { Sdk } from './Sdk';
import { BigNumber } from 'bignumber.js';

// Selectors
const tokenBalancesSelector = '#token-balances';
const allowanceToggleSelector = '.allowance-toggle';
const tableFixedSelector = '.table-fixed';
const wrapModalSelector = '#wrapModal';
const wrapEthAmountSelector = '#wrap-amount';
const wrapEthButtonSelector = '#wrap-eth-button';

// Wrap button clicked
$(wrapEthButtonSelector).click(wrapEthAsync);

/**
 * Wrap the amount
 * @param e The toggle clicked event
 */
export async function wrapEthAsync() {
  try {
    const wrapAmount = $(wrapEthAmountSelector).val() as string;
    await Sdk.Instance.account.wrapEthAsync(new BigNumber(wrapAmount), { awaitTransactionMined: true });
    await updateTokensAndTableAsync();
    $(wrapModalSelector).modal('hide');
  } catch (err) {
    console.log(err);
  }
}

/**
 * Toggle a tokens allowance and update the UI
 * @param e The toggle clicked event
 */
export async function toggleAllowanceAsync(e: JQuery.Event<HTMLInputElement>) {
  // Prevent initial toggle
  e.preventDefault();

  try {
    const { name, id, checked } = e.currentTarget;
    const newAllowance = checked ? new BigNumber(Sdk.Instance.zeroEx.token.UNLIMITED_ALLOWANCE_IN_BASE_UNITS) : new BigNumber(0);

    await Sdk.Instance.account.setTokenAllowanceAsync(name, newAllowance, { awaitTransactionMined: true });
    $(`#${id}`).prop('checked', checked).closest('div').attr('data-original-title', checked ? 'Disable Token' : 'Enable Token');
  } catch (err) {
    console.log(err);
  }
}

/**
 * Fetch all token balances and allowances
 * for this wallets default address
 */
export async function getAllTokenBalancesAndAllowancesAsync() {
  const tokenData = {};
  const total = Sdk.Instance.tokens.size();

  // get ETH balance
  const ethBal = await Sdk.Instance.account.getEthBalanceAsync();
  tokenData['ETH'] = {
    balance: ethBal.toNumber()
  };

  // get all token balances
  return new Promise(async resolve => {
    let current = 0;
    Sdk.Instance.tokens.forEach(async token => {
      const balance = await Sdk.Instance.account.getTokenBalanceAsync(token.address);
      if (balance.greaterThan(0)) {
        // Token has balance. Check the allowance
        const allowance = await Sdk.Instance.account.getTokenAllowanceAsync(token.address);
        tokenData[token.symbol] = {
          address: token.address,
          balance: balance.toNumber(),
          allowance: allowance.greaterThan(0) ? true : false
        }
      }
      current += 1;
      if (current >= total) {
        resolve(tokenData);
      }
    });
  });
}

/**
 * Fetch token balances and allowances and
 * update the html table
 */
export async function updateTokensAndTableAsync() {
  const tokenData = await getAllTokenBalancesAndAllowancesAsync();
  createTokensTable(tokenData);
}


/**
 * Create the tokens html table
 *
 * @param tokenBalances The token balances
 */
function createTokensTable(tokenData: {}) {
  const table = document.createElement('table');
  const tHead = table.createTHead();
  const tr = tHead.insertRow();
  const tBody = table.createTBody();
  const columnNames = ['Token', 'Balance', 'Action'];

  table.classList.add('table', 'table-fixed', 'table-striped', 'table-bordered', 'table-responsive-md');
  columnNames.forEach(name => {
    $(document.createElement('th')).addClass('text-center').html(name).appendTo(tr);
  });

  // Enable tooltips on page
  $(function () {
    $('[data-toggle="tooltip"]').tooltip();
  })

  // Populate table
  Object.keys(tokenData).forEach(key => {
    const tr = tBody.insertRow();
    $(tr.insertCell()).attr('align', 'middle').html(key); // Token Name
    $(tr.insertCell()).attr('align', 'middle').html(tokenData[key].balance.toFixed(7).replace(/\.0+$|(\.\d*[1-9])(0+)$/, '')); // Token Balance

    if (key === 'ETH') {
      $(tr.insertCell()).html('<span data-toggle="modal" data-target="#wrapModal"><button type="button" class="btn btn-success" data-toggle="tooltip" data-placement="left" title="Wrap ETH">Wrap</button></span>');
    } else {
      $(tr.insertCell()).html(`
        <div class="custom-control custom-toggle my-2" data-toggle="tooltip" data-placement="left"
          title="${tokenData[key].allowance ? 'Disable' : 'Enable'} Token">
          <input type="checkbox" id="${key.toLowerCase()}-toggle" class="custom-control-input allowance-toggle"
            name="${tokenData[key].address}" ${tokenData[key].allowance ? 'checked' : ''}>
          <label class="custom-control-label" for="${key.toLowerCase()}-toggle"></label>
        </div>
    `);
    }
  });

  // Insert table
  $(tokenBalancesSelector).html('').append(table);

  // Add click event
  $(allowanceToggleSelector).click(toggleAllowanceAsync);

  // Adjust width
  for (let i = 0; i < tr.cells.length; i++) {
    const thWidth = $(tableFixedSelector).find('th:eq(' + i + ')').width();
    const tdWidth = $(tableFixedSelector).find('td:eq(' + i + ')').width();
    if (thWidth < tdWidth) {
      $(tableFixedSelector).find('th:eq(' + i + ')').width(tdWidth);
    } else {
      $(tableFixedSelector).find('td:eq(' + i + ')').width(thWidth);
    }
  }
}
