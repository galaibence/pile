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

export const ListAccountsResponseSchema = {
    type: 'object', 
    properties: {
        status: { const: 'success' },
        data: {
            type: 'array',
            items: AccountSchema,
        },
    },
    required: [ 'status', 'data' ],
    additionalProperties: false,
} as const;

export const GetAccountResponseSchema = {
    type: 'object',
    properties: {
        status: { const: 'success' },
        data: AccountSchema,
    },
    required: [ 'status', 'data' ],
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
    required: [
        'id',
        'source',
        'amount',
        'recipient_name',
        'target_iban',
        'target_bic',
        'reference',
        'created_at',
    ],
    additionalProperties: false,
} as const;

export const ListTransactionsResponseSchema = {
    type: 'object',
    properties: {
        status: { const: 'success' },
        data: {
            type: 'array',
            items: TransactionSchema,        
        },
    },
    required: [ 'status', 'data' ],
    additionalProperties: false,
} as const;

export const CreateTransactionResponseSchema = {
    type: 'object',
    properties: {
        status: { const: 'success' },
        data: TransactionSchema,
    },
    required: [ 'status', 'data' ],
    additionalProperties: false,
} as const;

export const CreateTransactionErrorSchema = {
    type: 'object',
    properties: {
        status: { const: 'error',  },
        message: { type: 'string' },
    },
    required: [ 'status', 'message' ],
    additionalProperties: false,
} as const;
