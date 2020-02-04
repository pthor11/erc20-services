import axios from "axios"
import { createWriteStream } from "fs";

const START_BLOCK = 46147
// const START_BLOCK = 9041718

const call = (method: string, params: any) => {
    const data = JSON.stringify({
        method,
        params,
        jsonrpc: '2.0',
        id: 1
    })

    return axios({
        url: `http://localhost:8545`,
        data,
        headers: {
            'Content-Type': 'application/json'
        },
        method: 'post'
    })
}

const getBlock = async (block: number) => {
    try {
        const { data } = await call('eth_getBlockByNumber', [`0x${block.toString(16)}`, true])
        const { transactions } = data.result
        // console.log({ transactions });

        const contractCreationHashes = transactions.filter(tx => tx.to === null || tx.to === undefined).map(tx => tx.hash)
        // console.log({ contractCreationHashes });

        const receiptsResponses = await Promise.all(contractCreationHashes.map(hash => call('eth_getTransactionReceipt', [hash])))
        const contracts = receiptsResponses.map((response: any) => response.data.result.contractAddress)

        console.log(block, ...contracts);

        const logger = createWriteStream('contracts.txt', { flags: 'a' })

        for (const contract of contracts) {
            logger.write(block + ' ' +  contract + '\n')
        }

        logger.end(() => {
            getBlock(block + 1)
        })

    } catch (e) {
        console.log(e);
    }
}

const start = async () => {
    getBlock(START_BLOCK)
}

start()