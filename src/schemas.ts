export const ListAccountsQuerySchema = {
    type: 'object',
    properties: {
        from: { type: 'number' },
        limit: { type: 'number' },
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