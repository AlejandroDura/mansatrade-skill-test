import assert from "assert";
import { createTestClient, http, publicActions, walletActions, getContract } from "viem";
import { hardhat } from "viem/chains";
import MansaTrade from "../artifacts/contracts/mansatrade.sol/MansaTrade.json";
import ERC20Mock from "../artifacts/contracts/Mocks/ERC20Mock.sol/ERC20Mock.json";
import { describe, it } from "node:test";

export type User = {
    verified: boolean;
    thumbs_up: bigint;
    thumbs_down: bigint;
    region: number;
    user_address: `0x${string}`;
    offer_indexes: readonly bigint[];
    order_indexes: readonly bigint[];
};

export type Offer = {
    owner: `0x${string}`;
    token_address: `0x${string}`;
    fiat: string;
    rate: string;
    payment_options: string;
    public_key: string;
    offer_terms: string;
    token_amount: bigint;
    min_limit: bigint;
    max_limit: bigint;
    bought: bigint;
    created_at: bigint;
    offer_index: bigint;
    time_limit: Number;
    status: boolean;
    eth: boolean;
};

describe("MansaTrade", () => {
    it("Deploy MansaTrade", async () => {
        const client = createTestClient({
            chain: hardhat,
            mode: "hardhat",
            transport: http(),
        })
            .extend(publicActions)
            .extend(walletActions);

        const [deployer, user_fir_div, user_sec_div] = await client.getAddresses();

        const hash = await client.deployContract({
            account: deployer,
            abi: MansaTrade.abi,
            bytecode: MansaTrade.bytecode as `0x${string}`,
            args: [user_fir_div, user_sec_div],
        });

        const receipt = await client.waitForTransactionReceipt({ hash });

        if (!receipt.contractAddress) {
            throw new Error("Contract deployment failed: no address");
        }

        const mansatrade_address = receipt.contractAddress;

        const current_fir_div = await client.readContract({
            address: mansatrade_address,
            abi: MansaTrade.abi,
            functionName: "fir_div",
        });

        const current_sec_div = await client.readContract({
            address: mansatrade_address,
            abi: MansaTrade.abi,
            functionName: "sec_div",
        });

        const current_owner = await client.readContract({
            address: mansatrade_address,
            abi: MansaTrade.abi,
            functionName: "owner",
        });

        assert.equal(user_fir_div, current_fir_div);
        assert.equal(user_sec_div, current_sec_div);
        assert.equal(deployer, current_owner);

    });

    it("Test createOffer", async () => {
        const client = createTestClient({
            chain: hardhat,
            mode: "hardhat",
            transport: http(),
        })
            .extend(publicActions)
            .extend(walletActions);

        const [deployer, user_fir_div, user_sec_div, user_offer] = await client.getAddresses();

        //--------DEPLOY MANSATRADE CONTRACT-------//
        const hash = await client.deployContract({
            account: deployer,
            abi: MansaTrade.abi,
            bytecode: MansaTrade.bytecode as `0x${string}`,
            args: [user_fir_div, user_sec_div],
        });

        const receipt = await client.waitForTransactionReceipt({ hash });

        if (!receipt.contractAddress) {
            throw new Error("Contract deployment failed: no address");
        }

        const mansatrade_address = receipt.contractAddress;

        console.log("MansaTrade deployed at:", mansatrade_address);

        //------DEPLOY TOKEN MOCK CONTRACT--------//
        const hashToken = await client.deployContract({
            account: deployer,
            abi: ERC20Mock.abi,
            bytecode: ERC20Mock.bytecode as `0x${string}`,
        });

        const receiptToken = await client.waitForTransactionReceipt({ hash: hashToken });
        if (!receiptToken.contractAddress) {
            throw new Error("Contract deployment failed: no address");
        }

        const token_address = receiptToken.contractAddress;

        console.log("Token deployed at:", token_address);


        //-----CREATE OFFER-----//
        const token = getContract({
            address: token_address,
            abi: ERC20Mock.abi,
            client,
        });

        const mansaTrade = getContract({
            address: mansatrade_address,
            abi: MansaTrade.abi,
            client,
        });

        //Set expected offer values
        const expected_fiat = "Dollar"
        const expected_rate = "Rate"
        const expected_payment_options = "bank transfer"
        const expected_public_key = "abcd"
        const expected_offer_terms = "terms"
        const expected_time_limit = 100n
        const expected_eth = true
        const expected_token_amount = 1n * 10n ** 18n
        const expected_min_limit = 100n
        const expected_max_limit = 200n

        const expected_offer_index = 0n
        const expected_bought = 0;
        const expected_status = true;

        //Create new offer
        const create_offer_hash = await mansaTrade.write.createOffer([token.address, expected_fiat, expected_rate, expected_payment_options, expected_public_key, expected_offer_terms, expected_time_limit, expected_eth, expected_token_amount, expected_min_limit, expected_max_limit],
            { account: user_offer, });

        const create_offer_receipt = await client.waitForTransactionReceipt({ hash: create_offer_hash });

        const create_offer_block = await client.getBlock({
            blockNumber: create_offer_receipt.blockNumber,
        });

        const expected_created_at = create_offer_block.timestamp;

        //Read user info
        const user = (await mansaTrade.read.getUser([user_offer])) as User;

        //Read offer info
        const offer = (await mansaTrade.read.getOfferByIndex([expected_offer_index])) as Offer;

        //Assert user info
        assert.equal(user.offer_indexes[Number(expected_offer_index)], expected_offer_index);
        assert.equal(user.verified, false);
        assert.equal(user.thumbs_up, 0);
        assert.equal(user.thumbs_down, 0);
        assert.equal(user.user_address, user_offer);
        assert.equal(user.region, 0);
        assert.equal(user.order_indexes.length, 0);

        //Assert offer info
        assert.equal(offer.owner, user_offer);
        assert.equal(offer.token_address.toLocaleUpperCase, token.address.toLocaleUpperCase);
        assert.equal(offer.fiat, expected_fiat);
        assert.equal(offer.rate, expected_rate);
        assert.equal(offer.payment_options, expected_payment_options);
        assert.equal(offer.public_key, expected_public_key);
        assert.equal(offer.offer_terms, expected_offer_terms);
        assert.equal(offer.token_amount, expected_token_amount);
        assert.equal(offer.min_limit, expected_min_limit);
        assert.equal(offer.max_limit, expected_max_limit);
        assert.equal(offer.bought, expected_bought);
        assert(offer.created_at > 0n);
        assert.equal(offer.created_at, expected_created_at);
        assert.equal(offer.offer_index, expected_offer_index);
        assert.equal(offer.time_limit, expected_time_limit);
        assert.equal(offer.status, expected_status);
        assert.equal(offer.eth, expected_eth);
    });
});