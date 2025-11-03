import OpenAI from 'openai';
// Note: dotenv should be loaded in server.js before this module is imported

class OpenAIService {
  constructor() {
    // Prioritize Azure OpenAI API, fall back to standard OpenAI if needed
    const openaiApiKey = process.env.OPENAI_API_KEY?.trim();
    const azureApiKey = process.env.AZURE_OPENAI_API_KEY?.trim();
    
    // Validate API keys
    const isValidOpenAIKey = openaiApiKey && 
      openaiApiKey.length > 0 && 
      !openaiApiKey.includes('your-') && 
      !openaiApiKey.includes('placeholder');
    
    const isValidAzureKey = azureApiKey && 
      azureApiKey.length > 0 && 
      !azureApiKey.includes('your-') && 
      !azureApiKey.includes('placeholder');
    
    // Check for Azure endpoint and deployment
    const azureEndpoint = process.env.AZURE_OPENAI_ENDPOINT?.trim();
    const azureDeployment = process.env.AZURE_OPENAI_DEPLOYMENT_NAME?.trim();
    const hasAzureConfig = isValidAzureKey && azureEndpoint && azureDeployment && 
      !azureEndpoint.includes('your-') && !azureDeployment.includes('your-');
    
    // Debug logging
    console.log('🔑 Environment check:', {
      hasOpenAIKey: !!openaiApiKey,
      isValidOpenAIKey: !!isValidOpenAIKey,
      hasAzureKey: !!azureApiKey,
      hasAzureConfig: !!hasAzureConfig,
      openaiKeyPrefix: openaiApiKey?.substring(0, 10) || 'not set',
    });
    
    if (hasAzureConfig) {
      // Prioritize Azure OpenAI API
      console.log('✅ Using Azure OpenAI API');
      const endpoint = azureEndpoint.replace(/\/$/, ''); // Remove trailing slash
      this.client = new OpenAI({
        apiKey: azureApiKey,
        baseURL: `${endpoint}/openai/deployments/${azureDeployment}`,
        defaultQuery: { 'api-version': process.env.AZURE_OPENAI_API_VERSION || '2024-02-15-preview' },
        defaultHeaders: {
          'api-key': azureApiKey
        }
      });
      this.model = azureDeployment; // Use deployment name as model
      this.useAzure = true;
      
      // Initialize embeddings client if deployment name is provided
      const embeddingsEndpoint = process.env.AZURE_OPENAI_EMBEDDINGS_ENDPOINT?.replace(/\/$/, '');
      const embeddingDeployment = process.env.AZURE_OPENAI_EMBEDDING_DEPLOYMENT_NAME?.trim();
      
      if (embeddingsEndpoint && embeddingDeployment) {
        this.embeddingsClient = new OpenAI({
          apiKey: azureApiKey,
          baseURL: `${embeddingsEndpoint}/openai/deployments/${embeddingDeployment}`,
          defaultQuery: { 'api-version': process.env.AZURE_OPENAI_API_VERSION || '2024-02-15-preview' },
          defaultHeaders: {
            'api-key': azureApiKey
          }
        });
        this.embeddingsModel = embeddingDeployment;
        console.log(`📝 Using Azure model: ${this.model}, Embedding model: ${this.embeddingsModel}`);
      } else {
        console.log(`📝 Using Azure model: ${this.model} (embeddings not configured)`);
      }
    } else if (isValidOpenAIKey) {
      // Fall back to standard OpenAI API
      console.log('✅ Using standard OpenAI API');
      this.client = new OpenAI({
        apiKey: openaiApiKey
      });
      this.model = process.env.OPENAI_MODEL?.trim() || 'gpt-3.5-turbo';
      this.useAzure = false;
      
      // Initialize embeddings client for standard OpenAI
      const embeddingModel = process.env.OPENAI_EMBEDDING_MODEL?.trim() || 'text-embedding-ada-002';
      this.embeddingsClient = new OpenAI({
        apiKey: openaiApiKey
      });
      this.embeddingsModel = embeddingModel;
      console.log(`📝 Using model: ${this.model}, Embedding model: ${this.embeddingsModel}`);
    } else {
      // Don't crash if Azure keys are placeholders - they might be intentional
      // Only crash if no keys are set at all
      if (!openaiApiKey && !azureApiKey) {
        console.error('❌ No OpenAI API key found!');
        console.error('Please set OPENAI_API_KEY in your .env file in the backend directory');
        console.error('Example: OPENAI_API_KEY=sk-...');
        throw new Error('OPENAI_API_KEY must be set in environment variables');
      } else if (openaiApiKey) {
        console.error('❌ OPENAI_API_KEY found but appears to be invalid');
        console.error(`   Key length: ${openaiApiKey.length} characters`);
        console.error('   Please ensure it starts with "sk-" and is a valid OpenAI API key');
        throw new Error('OPENAI_API_KEY appears to be invalid. Please check your .env file');
      } else {
        console.error('❌ Azure OpenAI configuration incomplete');
        console.error('Please set valid Azure OpenAI credentials:');
        console.error('  - AZURE_OPENAI_ENDPOINT');
        console.error('  - AZURE_OPENAI_API_KEY');
        console.error('  - AZURE_OPENAI_DEPLOYMENT_NAME');
        console.error('Or set OPENAI_API_KEY for standard OpenAI API');
        throw new Error('No valid OpenAI API configuration found. Please configure Azure OpenAI or set OPENAI_API_KEY');
      }
    }
  }

  async generateResponse(messages, systemPrompt = null, options = {}) {
    try {
      const chatMessages = [];

      // Add system prompt if provided (must be first message)
      if (systemPrompt) {
        chatMessages.push({
          role: 'system',
          content: systemPrompt
        });
      }

      // Enhanced context management - preserve full conversation flow
      // Ensure proper message ordering and role alternation
      const processedMessages = this.processConversationContext(messages);
      chatMessages.push(...processedMessages);

      // Enhanced API parameters with prompt engineering optimizations
      const apiParams = {
        model: this.model,
        messages: chatMessages,
        temperature: options.temperature || 0.7, // Balanced creativity and consistency
        max_tokens: options.max_tokens || 800,   // Sufficient for detailed responses
        top_p: options.top_p || 0.9,              // Nucleus sampling for better quality
        frequency_penalty: options.frequency_penalty || 0.3, // Reduce repetition
        presence_penalty: options.presence_penalty || 0.3,     // Encourage topic diversity
      };

      // Log prompt engineering details in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`💬 Generating response with ${processedMessages.length} context messages`);
        console.log(`   Temperature: ${apiParams.temperature}, Max tokens: ${apiParams.max_tokens}`);
      }

      const response = await this.client.chat.completions.create(apiParams);

      return response.choices[0].message.content;
    } catch (error) {
      console.error('OpenAI API Error:', error);
      
      // Provide more helpful error messages
      if (error.message?.includes('ENOTFOUND') || error.message?.includes('Connection error')) {
        console.error('💡 Connection failed. Please check:');
        console.error('   1. Your internet connection');
        console.error('   2. OPENAI_API_KEY is valid and set correctly');
        console.error('   3. The API key has proper permissions');
        
        if (this.useAzure) {
          console.error('   4. Azure OpenAI endpoint is correct');
        }
      } else if (error.status === 401 || error.message?.includes('Unauthorized')) {
        console.error('💡 Authentication failed. Please check your OPENAI_API_KEY is valid');
      }
      
      throw new Error(`Failed to generate AI response: ${error.message || 'Unknown error'}`);
    }
  }

  buildSystemPrompt(faqContext = '', conversationSummary = '', webContext = '') {
    // Get company name from environment or use default
    const companyName = process.env.COMPANY_NAME?.trim() || 'our company';
    
    // Enhanced system prompt: company-specific, refined, professional
    const basePrompt = `You are an AI customer support assistant for ${companyName}. 

You must always act as the official virtual assistant of ${companyName} and respond in a polite, friendly, and professional tone.`;

    // Build Context section
    let contextSection = 'Context:\n';
    
    // Add FAQ context (primary source)
    if (faqContext) {
      contextSection += `${faqContext}\n`;
    } else {
      contextSection += `No specific FAQ data available. Use your knowledge while staying relevant to ${companyName}'s products or services.\n`;
    }
    
    // Add web context if available (secondary source)
    if (webContext) {
      contextSection += `\nAdditional web information:\n${webContext}\n`;
    }
    
    // Add conversation summary if available
    if (conversationSummary) {
      contextSection += `\nConversation history summary:\n${conversationSummary}\n`;
    }

    // Guidelines section
    const guidelines = `
Guidelines:

1. Always base your answers primarily on the FAQ and company data provided above.

2. If the answer is not explicitly found in the FAQ, respond naturally using your general knowledge — but keep your tone and content relevant to ${companyName}'s products or services.

3. Never say "check the website" or "I suggest" — instead, explain or guide directly.

4. If a question cannot be answered confidently, politely say: "I'm not sure about that specific detail — would you like me to connect you with our human support team?"

5. Always personalize responses to sound like a real agent of ${companyName}.

6. Keep responses short, clear, and user-friendly (2–5 sentences).

7. When web information is provided, use it to enhance your answer while keeping the FAQ as the primary source.

8. Make responses feel tailored and specific to ${companyName}'s brand, products, and services.`;

    // Complete system prompt
    const fullPrompt = `${basePrompt}

${contextSection}${guidelines}`;

    return fullPrompt;
  }

  /**
   * Generate embeddings for text using OpenAI API
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
        model: this.embeddingsModel,
        input: text
      });

      return response.data[0].embedding;
    } catch (error) {
      console.error('Embedding generation error:', error);
      return null;
    }
  }

  /**
   * Process conversation context to maintain flow and improve prompt quality
   * Ensures proper message ordering and role alternation
   * @param {Array} messages - Array of message objects
   * @returns {Array} Processed messages optimized for context
   */
  processConversationContext(messages) {
    if (!messages || messages.length === 0) {
      return [];
    }

    // Filter and validate messages
    const validMessages = messages
      .filter(msg => msg && msg.role && msg.content && msg.content.trim())
      .map(msg => ({
        role: msg.role,
        content: msg.content.trim()
      }));

    // Ensure proper role alternation (user -> assistant -> user...)
    const processed = [];
    let lastRole = null;

    for (const msg of validMessages) {
      // Skip duplicate consecutive messages from same role
      if (msg.role === lastRole && lastRole === 'assistant') {
        continue; // Skip duplicate assistant messages
      }
      
      // If we have multiple user messages in a row, keep the latest one
      if (msg.role === 'user' && lastRole === 'user' && processed.length > 0) {
        processed.pop(); // Remove previous user message
      }

      processed.push(msg);
      lastRole = msg.role;
    }

    return processed;
  }

  /**
   * Generate a conversation summary for context maintenance
   * @param {Array} messages - Previous conversation messages
   * @returns {string} Brief summary of conversation context
   */
  generateConversationSummary(messages) {
    if (!messages || messages.length === 0) {
      return '';
    }

    // Take last few exchanges for summary
    const recentMessages = messages.slice(-6); // Last 3 exchanges (6 messages)
    
    const userMessages = recentMessages
      .filter(msg => msg.role === 'user')
      .map(msg => msg.content)
      .join('; ');

    if (userMessages) {
      return `Recent topics discussed: ${userMessages.substring(0, 200)}${userMessages.length > 200 ? '...' : ''}`;
    }

    return '';
  }
}

export default new OpenAIService();



