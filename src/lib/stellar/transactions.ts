import freighterApi from "@stellar/freighter-api";
import type { NetworkType } from "./wallet";
import { getNetworkPassphrase, getRpcUrl } from "./wallet";
import type { TransactionResult } from "@/types/stellar";

/**
 * Build and sign a transaction using Freighter.
 * This is a simplified helper; real implementations would use
 * @stellar/stellar-sdk to construct the Transaction object.
 */
export async function signAndSubmitTransaction(
  xdr: string,
  network: NetworkType
): Promise<TransactionResult> {
  const passphrase = getNetworkPassphrase(network);

  const signed = await freighterApi.signTransaction(xdr, {
    networkPassphrase: passphrase,
  });

  if (signed.error) {
    return { hash: "", success: false, error: signed.error };
  }

  try {
    const rpcUrl = getRpcUrl(network);
    const response = await fetch(rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "sendTransaction",
        params: [signed.signedTxXdr],
      }),
    });

    const result = await response.json();

    if (result.error) {
      return { hash: "", success: false, error: result.error.message };
    }

    return {
      hash: result.result.hash,
      success: true,
      ledger: result.result.ledger,
    };
  } catch (err) {
    return {
      hash: "",
      success: false,
      error: err instanceof Error ? err.message : "Transaction failed",
    };
  }
}

/**
 * Simulate a Soroban contract call (read-only).
 */
export async function simulateContractCall(
  contractAddress: string,
  method: string,
  args: unknown[],
  network: NetworkType
): Promise<unknown> {
  const rpcUrl = getRpcUrl(network);
  const response = await fetch(rpcUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "simulateTransaction",
      params: [{ contractAddress, method, args }],
    }),
  });
  const result = await response.json();
  if (result.error) {
    throw new Error(result.error.message);
  }
  return result.result;
}
