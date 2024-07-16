const fastify = require('fastify')();
fastify.register(require('@fastify/cors'), {
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
});
const { Configuration, OpenAIApi } = require("openai-edge");

const configuration = new Configuration({
  apiKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5MGE2ZTgxLTRiMDMtNGQxNC1hMGQxLWI3N2RkZjlkMDY2ZiIsImlzRGV2ZWxvcGVyIjp0cnVlLCJpYXQiOjE3MjA1Mjk0NDgsImV4cCI6MjAzNjEwNTQ0OH0.Dm8QJpXfX2ChWcYZ5c0SLNzGpmEmh1dYPAMW3wz4v5M",
  basePath: "https://bothub.chat/api/v2/openai/v1",
});

const openai = new OpenAIApi(configuration);

const getChatCompletion = async (userMessage) => {
  try {
    const completion = await openai.createChatCompletion({
      messages: [
        { role: "user", content: userMessage }
      ],
      model: "gemini-pro",
    });

    const completionJson = await completion.json();

    if (completionJson.choices && completionJson.choices.length > 0) {
      return completionJson.choices[0].message.content;
    } else {
      return 'No choices found in the response.';
    }
  } catch (error) {
    console.error('Error fetching chat completion:', error);
    return 'Error fetching chat completion.';
  }
};

(async () => {
  fastify.get('/', (req, reply) => {
    reply.send('Chat is running!')
  });

  fastify.post('/chat', async (req, reply) => {
    try {
      const { message } = req.body;

      if (!message) {
        reply.status(400).send('Message is required.');
        return;
      }

      const response = await getChatCompletion(message);
    
      reply.send({ message: response, CAPS: Math.floor(Math.random() * 15) + 1 });

    } catch (error) {
      console.error('Error fetching chat completion:', error);
      reply.status(500).send('Error fetching chat completion.');
    }
  });

  fastify.setNotFoundHandler((req, reply) => {
    reply.code(404).send('This route not found.');
  });

  fastify.listen({ port: 4545 }, (err, address) => {
    if (err) throw err;
    console.log(`The server is running! (${address})`);
  });
})();