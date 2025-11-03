# Company Setup Guide

## Setting Company Name

To customize the AI assistant to represent your company, set the `COMPANY_NAME` environment variable in your `.env` file:

```bash
COMPANY_NAME=Myntra
```

Or for other companies:

```bash
COMPANY_NAME=Snitch
COMPANY_NAME=Nykaa
COMPANY_NAME=Flipkart
```

## How It Works

The AI assistant will:
1. Use the company name throughout all responses
2. Personalize responses to sound like an agent of that specific company
3. Reference company-specific products, services, and policies
4. Maintain brand-aligned tone and content

## Example

If `COMPANY_NAME=Myntra`:
- Responses will mention "Myntra" as the company
- Tone and content will be aligned with Myntra's brand
- FAQ context will be interpreted in Myntra's context
- Web search results will be filtered and presented as Myntra-specific information

## FAQ Context

The system automatically:
1. Searches your uploaded FAQs (top 3-5 most relevant)
2. Uses semantic search with embeddings
3. Falls back to keyword search if embeddings aren't available
4. Combines FAQ data with web search when needed

