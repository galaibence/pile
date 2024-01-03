const PaginatedQuerySchemaBits = {
    from: { type: 'number' },
    limit: { type: 'number' },
} as const;

export const ListAccountsQuerySchema = {
    type: 'object',
    properties: {
        ...PaginatedQuerySchemaBits,
        min: { type: 'number' },
        max: { type: 'number' },
    },
    additionalProperties: false,
} as const;

export const GetAccountParamsSchema = {
    type: 'object',
    properties: {
        id: { type: 'string' },
    },
    required: ['id'],
    additionalProperties: false,
} as const;

export const ListTransactionsQuerySchema = {
    type: 'object',
    properties: {
        ...PaginatedQuerySchemaBits,
    },
    additionalProperties: false,
} as const;

export const CreateTransactionBodySchema = {
    type: 'object',
    properties: {
        sourceAccountId: { type: 'string'},
        amount: { type: 'number'},
        recipientName: { type: 'string'},
        targetIban: { type: 'string'},
        targetBic: { type: 'string'},
        reference: { type: 'string'},
    },
    required: [
        'sourceAccountId',
        'amount',
        'recipientName',
        'targetIban',
        'targetBic',
        'reference',
    ],
    additionalProperties: false,
} as const;
