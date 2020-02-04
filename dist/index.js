"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const fs_1 = require("fs");
const START_BLOCK = 46147;
// const START_BLOCK = 9041718
const call = (method, params) => {
    const data = JSON.stringify({
        method,
        params,
        jsonrpc: '2.0',
        id: 1
    });
    return axios_1.default({
        url: `http://localhost:8545`,
        data,
        headers: {
            'Content-Type': 'application/json'
        },
        method: 'post'
    });
};
const getBlock = (block) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { data } = yield call('eth_getBlockByNumber', [`0x${block.toString(16)}`, true]);
        const { transactions } = data.result;
        // console.log({ transactions });
        const contractCreationHashes = transactions.filter(tx => tx.to === null || tx.to === undefined).map(tx => tx.hash);
        // console.log({ contractCreationHashes });
        const receiptsResponses = yield Promise.all(contractCreationHashes.map(hash => call('eth_getTransactionReceipt', [hash])));
        const contracts = receiptsResponses.map((response) => response.data.result.contractAddress);
        console.log(block, ...contracts);
        const logger = fs_1.createWriteStream('contracts.txt', { flags: 'a' });
        for (const contract of contracts) {
            logger.write(block + ' ' + contract + '\n');
        }
        logger.end(() => {
            getBlock(block + 1);
        });
    }
    catch (e) {
        console.log(e);
    }
});
const start = () => __awaiter(void 0, void 0, void 0, function* () {
    getBlock(START_BLOCK);
});
start();
