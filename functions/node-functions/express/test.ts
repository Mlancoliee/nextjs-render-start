export const onRequestGet = async (context: unknown): Promise<Response> => {
  return new Response('Test, World!', {
    status: 200,
    headers: { 'Content-Type': 'text/plain; charset=UTF-8' },
  });
};

