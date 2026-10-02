import { Buffer } from "buffer";
import {
  Asset,
  Contract,
  Account,
  Horizon,
  Operation,
  TransactionBuilder,
  rpc,
  xdr,
} from "@stellar/stellar-sdk";
import type { NetworkType, WalletProviderId } from "./wallet";
import {
  getNetworkPassphrase,
  getHorizonUrl,
  getRpcUrl,
  getSelectedWalletId,
  signWalletTransaction,
} from "./wallet";
import type { TransactionResult } from "@/types/stellar";

export interface BuildPaymentTxParams {
  sourceAddress: string;
  destinationAddress: string;
  amount: string;
  network: NetworkType;
  asset?: { code: string; issuer: string };
  fee?: string;
  timeoutSeconds?: number;
}

export interface BuildContractInvokeTxParams {
  sourceAddress: string;
  contractAddress: string;
  method: string;
  args?: unknown[];
  network: NetworkType;
  timeoutSeconds?: number;
}

function toScVal(arg: unknown): xdr.ScVal {
  if (typeof arg === "string") return xdr.ScVal.scvString(arg);
  if (typeof arg === "number") {
    if (!Number.isInteger(arg))
      throw new Error("Contract number arguments must be integers.");
    return arg < 0 ? xdr.ScVal.scvI32(arg) : xdr.ScVal.scvU32(arg);
  }
  if (typeof arg === "bigint") {
    return xdr.ScVal.scvU64(xdr.Uint64.fromString(arg.toString()));
  }
  if (typeof arg === "boolean") return xdr.ScVal.scvBool(arg);
  if (arg instanceof Uint8Array) return xdr.ScVal.scvBytes(Buffer.from(arg));
  return xdr.ScVal.scvString(JSON.stringify(arg));
}

export async function buildPaymentTx({
  sourceAddress,
  destinationAddress,
  amount,
  network,
  asset,
  fee = "100",
  timeoutSeconds = 180,
}: BuildPaymentTxParams): Promise<string> {
  if (!/^\d+(\.\d{1,7})?$/.test(amount) || Number(amount) <= 0) {
    throw new Error(
      "Payment amount must be positive and have at most 7 decimal places.",
    );
  }

  const server = new Horizon.Server(getHorizonUrl(network));
  const sourceAccount = await server.loadAccount(sourceAddress);
  const paymentAsset = asset
    ? new Asset(asset.code, asset.issuer)
    : Asset.native();
  const transaction = new TransactionBuilder(sourceAccount, {
    fee,
    networkPassphrase: getNetworkPassphrase(network),
  })
    .addOperation(
      Operation.payment({
        destination: destinationAddress,
        asset: paymentAsset,
        amount,
      }),
    )
    .setTimeout(timeoutSeconds)
    .build();

  return transaction.toXDR();
}

export async function buildContractInvokeTx({
  sourceAddress,
  contractAddress,
  method,
  args = [],
  network,
  timeoutSeconds = 300,
}: BuildContractInvokeTxParams): Promise<string> {
  if (!method.trim()) throw new Error("Contract method is required.");

  const server = new rpc.Server(getRpcUrl(network));
  const account = await server.getAccount(sourceAddress);
  const transaction = new TransactionBuilder(account, {
    fee: "100",
    networkPassphrase: getNetworkPassphrase(network),
  })
    .addOperation(
      new Contract(contractAddress).call(method, ...args.map(toScVal)),
    )
    .setTimeout(timeoutSeconds)
    .build();

  const preparedTransaction = await server.prepareTransaction(transaction);
  return preparedTransaction.toXDR();
}

/** Sign an XDR transaction with the selected wallet and submit it to Stellar RPC. */
export async function signAndSubmit(
  xdr: string,
  network: NetworkType,
  providerId: WalletProviderId = getSelectedWalletId(),
): Promise<TransactionResult> {
  const passphrase = getNetworkPassphrase(network);

  try {
    const signedXdr = await signWalletTransaction(xdr, network, providerId);
    const signedTransaction = TransactionBuilder.fromXDR(signedXdr, passphrase);
    const response = await new rpc.Server(getRpcUrl(network)).sendTransaction(
      signedTransaction,
    );

    if (response.status !== "PENDING" && response.status !== "DUPLICATE") {
      return {
        hash: "",
        success: false,
        error:
          response.status === "TRY_AGAIN_LATER"
            ? "Stellar RPC could not accept the transaction yet. Please try again."
            : (response.errorResult?.toXDR("base64") ??
              "Stellar RPC rejected the transaction."),
      };
    }
    if (!response.hash) {
      return {
        hash: "",
        success: false,
        error: "Invalid RPC response: missing transaction hash.",
      };
    }

    return {
      hash: response.hash,
      success: true,
    };
  } catch (err) {
    return {
      hash: "",
      success: false,
      error: err instanceof Error ? err.message : "Transaction failed",
    };
  }
}

export const signAndSubmitTransaction = signAndSubmit;

/**
 * Simulate a Soroban contract call (read-only).
 */
export async function simulateContractCall(
  contractAddress: string,
  method: string,
  args: unknown[],
  network: NetworkType,
): Promise<unknown> {
  const passphrase = getNetworkPassphrase(network);
  const contract = new Contract(contractAddress);

  const txBuilder = new TransactionBuilder(new Account(contractAddress, "0"), {
    fee: "100",
    networkPassphrase: passphrase,
  });

  const sorobanArgs = args.map(toScVal);

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
      id: 1,
      method: "simulateTransaction",
      params: [txXdr],
    }),
  });
  const result = await response.json();
  if (result.error) {
    throw new Error(result.error.message);
  }
  return result.result;
}
