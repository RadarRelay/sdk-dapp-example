import { RadarRelay } from '@radarrelay/sdk';

/**
 * Fetch all token balances
 * for this wallets default address
 */
export async function getAllTokenBalancesAsync(rr: RadarRelay) {
  const balances = {};
  const total = rr.tokens.size();

  // get ETH balance
  const ethBal = await rr.account.getEthBalanceAsync();
  balances['ETH'] = ethBal.toNumber();

  // get all token balances
  return new Promise(async resolve => {
    let current = 0;
    rr.tokens.forEach(token => {
      rr.account.getTokenBalanceAsync(token.address).then(bal => {
        if (bal.gt(0)) {
          balances[token.symbol] = bal.toNumber();
        }
        current += 1;
        if (current >= total) {
          resolve(balances);
        }
      });
    });
  });
}

/**
 * Fetches the token balances and updates
 * the table in the UI
 */
export async function updateBalancesAndTableAsync(rr: RadarRelay) {
  const tokenBalances = await this.getAllTokenBalancesAsync(rr);
  this.createBalancesTable(tokenBalances);
}

/**
 * Create a token balances html table
 *
 * @param tokenBalances The token balances
 */
export function createBalancesTable(tokenBalances: {}) {
  const table = document.createElement('table');
  const tHead = table.createTHead();
  const tr = tHead.insertRow();
  const tBody = table.createTBody();

  table.classList.add('table', 'table-striped', 'table-responsive-md');
  tr.appendChild(document.createElement('th')).innerHTML = 'Token';
  tr.appendChild(document.createElement('th')).innerHTML = 'Balance';

  // Populate table
  Object.keys(tokenBalances).forEach(key => {
    const tr = tBody.insertRow();
    tr.insertCell().innerHTML = key;
    tr.insertCell().innerHTML = tokenBalances[key].toFixed(7).replace(/\.0+$|(\.\d*[1-9])(0+)$/, '');
  });

  // Insert table
  $('#token-balances').html('');
  $('#token-balances').append(table);
}
