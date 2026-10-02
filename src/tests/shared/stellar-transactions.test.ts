import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  Account,
  Keypair,
  StrKey,
  TransactionBuilder,
} from "@stellar/stellar-sdk";

const mocks = vi.hoisted(() => ({
  loadAccount: vi.fn(),
  getAccount: vi.fn(),
  prepareTransaction: vi.fn(),
  sendTransaction: vi.fn(),
  signWalletTransaction: vi.fn(),
}));

vi.mock("@stellar/stellar-sdk", async (importOriginal) => {
  const sdk = await importOriginal<typeof import("@stellar/stellar-sdk")>();
  return {
    ...sdk,
    Horizon: {
      ...sdk.Horizon,
      Server: class {
        loadAccount = mocks.loadAccount;
      },
    },
    rpc: {
      ...sdk.rpc,
      Server: class {
        getAccount = mocks.getAccount;
        prepareTransaction = mocks.prepareTransaction;
        sendTransaction = mocks.sendTransaction;
      },
    },
  };
});

vi.mock("@/lib/stellar/wallet", async (importOriginal) => {
  const wallet = await importOriginal<typeof import("@/lib/stellar/wallet")>();
  return { ...wallet, signWalletTransaction: mocks.signWalletTransaction };
});

const sourceAddress = Keypair.random().publicKey();
const destinationAddress = Keypair.random().publicKey();
const sourceAccount = new Account(sourceAddress, "1");

beforeEach(() => {
  mocks.loadAccount.mockReset().mockResolvedValue(sourceAccount);
  mocks.getAccount.mockReset().mockResolvedValue(sourceAccount);
  mocks.prepareTransaction
    .mockReset()
    .mockImplementation((transaction) => transaction);
  mocks.sendTransaction
    .mockReset()
    .mockResolvedValue({ status: "PENDING", hash: "tx-hash" });
  mocks.signWalletTransaction.mockReset();
});

describe("Stellar transaction helpers", () => {
  it("builds a native payment transaction with the requested amount and recipient", async () => {
    const { buildPaymentTx } = await import("@/lib/stellar/transactions");
    const builtXdr = await buildPaymentTx({
      sourceAddress,
      destinationAddress,
      amount: "1.25",
      network: "testnet",
    });
    const transaction = TransactionBuilder.fromXDR(
      builtXdr,
      "Test SDF Network ; September 2015",
    );

    expect(transaction.operations[0]).toMatchObject({
      type: "payment",
      destination: destinationAddress,
      amount: "1.2500000",
    });
    expect(mocks.loadAccount).toHaveBeenCalledWith(sourceAddress);
  });

  it("rejects invalid payment amounts before loading an account", async () => {
    const { buildPaymentTx } = await import("@/lib/stellar/transactions");

    await expect(
      buildPaymentTx({
        sourceAddress,
        destinationAddress,
        amount: "0",
        network: "testnet",
      }),
    ).rejects.toThrow("Payment amount must be positive");
    expect(mocks.loadAccount).not.toHaveBeenCalled();
  });

  it("builds and prepares a Soroban contract invocation", async () => {
    const { buildContractInvokeTx } =
      await import("@/lib/stellar/transactions");
    const builtXdr = await buildContractInvokeTx({
      sourceAddress,
      contractAddress: StrKey.encodeContract(Keypair.random().rawPublicKey()),
      method: "claim",
      args: ["course-1", 2],
      network: "testnet",
    });
    const transaction = TransactionBuilder.fromXDR(
      builtXdr,
      "Test SDF Network ; September 2015",
    );

    expect(transaction.operations[0].type).toBe("invokeHostFunction");
    expect(mocks.getAccount).toHaveBeenCalledWith(sourceAddress);
    expect(mocks.prepareTransaction).toHaveBeenCalledOnce();
  });

  it("signs through the selected provider and submits via Stellar RPC", async () => {
    const { buildPaymentTx, signAndSubmit } =
      await import("@/lib/stellar/transactions");
    const builtXdr = await buildPaymentTx({
      sourceAddress,
      destinationAddress,
      amount: "1",
      network: "testnet",
    });
    mocks.signWalletTransaction.mockResolvedValue(builtXdr);

    await expect(signAndSubmit(builtXdr, "testnet", "lobstr")).resolves.toEqual(
      {
        hash: "tx-hash",
        success: true,
      },
    );
    expect(mocks.signWalletTransaction).toHaveBeenCalledWith(
      builtXdr,
      "testnet",
      "lobstr",
    );
    expect(mocks.sendTransaction).toHaveBeenCalledOnce();
  });

  it("does not report TRY_AGAIN_LATER as a successful submission", async () => {
    const { buildPaymentTx, signAndSubmit } =
      await import("@/lib/stellar/transactions");
    const builtXdr = await buildPaymentTx({
      sourceAddress,
      destinationAddress,
      amount: "1",
      network: "testnet",
    });
    mocks.signWalletTransaction.mockResolvedValue(builtXdr);
    mocks.sendTransaction.mockResolvedValue({
      status: "TRY_AGAIN_LATER",
      hash: "tx-hash",
    });

    await expect(signAndSubmit(builtXdr, "testnet")).resolves.toMatchObject({
      hash: "",
      success: false,
      error: expect.stringContaining("try again"),
    });
  });
});
