export const onRequestGet = async (context: unknown): Promise<Response> => {
  const a = 3
  a = 4
  return new Response('Hello, World!', {
    status: 200,
    headers: { 'Content-Type': 'text/plain; charset=UTF-8' },
  });
};

