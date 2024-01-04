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

export const AccountSchema = {
    type: 'object',
    properties: {
        id: { type: 'string' },
        iban: { type: 'string' },
        country: { type: 'string' },
        created_at: { type: 'string' },
        name: { type: 'string' },
        balances: {
            type: 'object',
            properties: {
                available: {
                    type: 'object',
                    properties: {
                        value: { type: 'number' },
                        currency: { type: 'string' },
                    },
                    additionalProperties: false,
                },
            },
        },
    },
    required: [ 'id', 'iban', 'country', 'created_at', 'name' ],
    additionalProperties: false,
} as const;

export const TransactionSchema = {
    type: 'object',
    properties: {
        id: { type: 'string' },
        source: { type: 'string' },
        amount: { type: 'number' },
        recipient_name: { type: 'string' },
        target_iban: { type: 'string' },
        target_bic: { type: 'string' },
        reference: { type: 'string' },
        created_at: { type: 'string' },
    },
    required: [],
    additionalProperties: false,
} as const;

export const ListTransactionsResponseSchema = {
    type: 'array',
    items: TransactionSchema,
} as const;