describe('api setup', () => {
    it('requires a valid api key', async () => {
        const response1 = await fetch('http://0.0.0.0:3000/accounts');
        expect(response1.status).toEqual(401);

        const response2 = await fetch('http://0.0.0.0:3000/accounts', {
            headers: {
                'x-api-key': 'secret-1',
            }
        });
        expect(response2.status).toEqual(200);
    });
});
