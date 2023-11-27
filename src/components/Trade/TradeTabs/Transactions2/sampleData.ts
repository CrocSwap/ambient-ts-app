import { TransactionServerIF } from '../../../../utils/interfaces/TransactionIF';

interface samepleDataIF {
    data: TransactionServerIF[];
    provenance: {
        hostname: string;
        serveTime: number;
    };
};

export const sampleData: samepleDataIF = {
    data: [
        {
            block: 18592422,
            txHash: '0x86df46232b44c32a9664c83cd56a55aca8fbb791a13a6c606470f816d7c5b4f0',
            txTime: 1700234087,
            user: '0x5964de90ab9ea1bf1151bc836f967cc6f9810006',
            chainId: '0x1',
            base: '0x0000000000000000000000000000000000000000',
            quote: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
            poolIdx: 420,
            baseFlow: 10000000000000000,
            quoteFlow: -19267665,
            entityType: 'swap',
            changeType: 'swap',
            positionType: 'swap',
            bidTick: 0,
            askTick: 0,
            isBuy: true,
            inBaseQty: true,
            txId: 'tx_735b375950dca9c42d6a3d2a7fd55eff6bba7c27323b75c9b2c8f8daf8af391a',
            limitPrice: 0,
        },
        {
            block: 18592314,
            txHash: '0x9a99ca4273ba4c3fc37055b2d1a9c632897f6f42a45c2afecbfb4e20061e82bf',
            txTime: 1700232779,
            user: '0x425a4a539c085ff2568e19ee1304e97a92688959',
            chainId: '0x1',
            base: '0x0000000000000000000000000000000000000000',
            quote: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
            poolIdx: 420,
            baseFlow: 9819569434490212000,
            quoteFlow: -18937201379,
            entityType: 'swap',
            changeType: 'swap',
            positionType: 'swap',
            bidTick: 0,
            askTick: 0,
            isBuy: true,
            inBaseQty: true,
            txId: 'tx_c4cd10d53bff5a8e7cb84bb3cbf17498b3194ed26c45210334797e955d10f4e1',
            limitPrice: 0,
        },
        {
            block: 18592306,
            txHash: '0x8919e4d2cab85258fd5e5b6c74065ae3b341a9bd18104c0ddffe2705a6ddd27d',
            txTime: 1700232683,
            user: '0x425a4a539c085ff2568e19ee1304e97a92688959',
            chainId: '0x1',
            base: '0x0000000000000000000000000000000000000000',
            quote: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
            poolIdx: 420,
            baseFlow: 10435932497047069000,
            quoteFlow: -20163366308,
            entityType: 'swap',
            changeType: 'swap',
            positionType: 'swap',
            bidTick: 0,
            askTick: 0,
            isBuy: true,
            inBaseQty: true,
            txId: 'tx_dee0c42fcc9fc30e5afb28196d8967e1d65ae66d1da453a9d1150ef2bd743821',
            limitPrice: 0,
        },
    ],
    provenance: {
        hostname: 'server-small-deployment-7b46798c86-pmsj5',
        serveTime: 1700235212593,
    },
};
