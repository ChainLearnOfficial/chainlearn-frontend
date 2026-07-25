import freighterApi from "@stellar/freighter-api";
import { Contract, Address, TransactionBuilder, xdr } from "@stellar/stellar-sdk";
import type { NetworkType } from "./wallet";
import { getNetworkPassphrase, getRpcUrl } from "./wallet";
import type { TransactionResult } from "@/types/stellar";

function generateJsonRpcId(): number {
  return Math.floor(Math.random() * 1000000) + 1;
}

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
        id: generateJsonRpcId(),
        method: "sendTransaction",
        params: [signed.signedTxXdr],
      }),
    });

    const result = await response.json();

    if (result.error) {
      return { hash: "", success: false, error: result.error.message };
    }

    if (!result.result?.hash) {
      return {
        hash: "",
        success: false,
        error: "Invalid RPC response: missing transaction hash",
      };
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
  const passphrase = getNetworkPassphrase(network);
  const contract = new Contract(contractAddress);

  const txBuilder = new TransactionBuilder(
    new Address(contractAddress),
    {
      fee: "100",
      networkPassphrase: passphrase,
    }
  );

  const sorobanArgs = args.map((arg) => {
    if (typeof arg === "string") return xdr.ScVal.scvString(arg);
    if (typeof arg === "number") return xdr.ScVal.scvU32(arg);
    if (typeof arg === "bigint") return xdr.ScVal.scvU64(arg);
    if (typeof arg === "boolean") return xdr.ScVal.scvBool(arg);
    if (arg instanceof Uint8Array) return xdr.ScVal.scvBytes(arg);
    return xdr.ScVal.scvString(JSON.stringify(arg));
  });

  const tx = txBuilder
    .addOperation(contract.call(method, ...sorobanArgs))
    .setTimeout(300)
    .build();

  const txXdr = tx.toEnvelope().toXDR("base64");

  const rpcUrl = getRpcUrl(network);
  const response = await fetch(rpcUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: generateJsonRpcId(),
      method: "simulateTransaction",
      params: [txXdr],
    }),
  });
  const result = await response.json();
  if (result.error) {
    throw new Error(result.error.message);
  }

  const resultArray = result.result;
  if (!resultArray || !Array.isArray(resultArray) || resultArray.length === 0) {
    throw new Error("Invalid simulation result: no results returned");
  }

  return resultArray[0];
}
