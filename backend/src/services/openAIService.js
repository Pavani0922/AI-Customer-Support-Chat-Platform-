import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

class OpenAIService {
  constructor() {
    // Initialize OpenAI client for Azure OpenAI
    const endpoint = process.env.AZURE_OPENAI_ENDPOINT?.replace(/\/$/, ''); // Remove trailing slash
    this.client = new OpenAI({
      apiKey: process.env.AZURE_OPENAI_API_KEY,
      baseURL: `${endpoint}/openai/deployments/${process.env.AZURE_OPENAI_DEPLOYMENT_NAME}`,
      defaultQuery: { 'api-version': process.env.AZURE_OPENAI_API_VERSION || '2024-02-15-preview' },
      defaultHeaders: {
        'api-key': process.env.AZURE_OPENAI_API_KEY
      }
    });
    this.deploymentName = process.env.AZURE_OPENAI_DEPLOYMENT_NAME;
    
    // Initialize embeddings client if deployment name is provided
    const embeddingsEndpoint = process.env.AZURE_OPENAI_EMBEDDINGS_ENDPOINT?.replace(/\/$/, '');
    if (embeddingsEndpoint) {
      this.embeddingsClient = new OpenAI({
        apiKey: process.env.AZURE_OPENAI_API_KEY,
        baseURL: `${embeddingsEndpoint}/openai/deployments/${process.env.AZURE_OPENAI_EMBEDDING_DEPLOYMENT_NAME}`,
        defaultQuery: { 'api-version': process.env.AZURE_OPENAI_API_VERSION || '2024-02-15-preview' },
        defaultHeaders: {
          'api-key': process.env.AZURE_OPENAI_API_KEY
        }
      });
      this.embeddingsDeploymentName = process.env.AZURE_OPENAI_EMBEDDING_DEPLOYMENT_NAME;
    }
  }

  async generateResponse(messages, systemPrompt = null) {
    try {
      const chatMessages = [];

      // Add system prompt if provided
      if (systemPrompt) {
        chatMessages.push({
          role: 'system',
          content: systemPrompt
        });
      }

      // Add conversation history
      chatMessages.push(...messages);

      const response = await this.client.chat.completions.create({
        model: this.deploymentName,
        messages: chatMessages,
        temperature: 0.7,
        max_tokens: 800
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error('OpenAI API Error:', error);
      throw new Error('Failed to generate AI response');
    }
  }

  buildSystemPrompt(faqContext = '') {
    const basePrompt = `You are a helpful and professional customer support agent. Your goal is to assist users with their questions and provide accurate, friendly, and concise responses.`;

    if (faqContext) {
      return `${basePrompt}

Use the following company information and FAQs to answer questions accurately:

${faqContext}

When answering:
- Use the provided information when relevant
- If the question isn't covered in the provided information, use your general knowledge
- Be conversational and friendly
- Keep responses concise but informative`;
    }

    return basePrompt;
  }

  /**
   * Generate embeddings for text using Azure OpenAI
   * @param {string} text - Text to generate embeddings for
   * @returns {Promise<Array<number>>} Embedding vector
   */
  async generateEmbedding(text) {
    try {
      if (!this.embeddingsClient) {
        console.warn('Embeddings client not configured, falling back to keyword-based search');
        return null;
      }

      const response = await this.embeddingsClient.embeddings.create({
        model: this.embeddingsDeploymentName,
        input: text
      });

      return response.data[0].embedding;
    } catch (error) {
      console.error('Embedding generation error:', error);
      return null;
    }
  }
}

export default new OpenAIService();



