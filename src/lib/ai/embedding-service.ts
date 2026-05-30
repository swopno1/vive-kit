import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { embed, embedMany } from 'ai';
import { env } from './ai-config';

export class EmbeddingService {
  private google = createGoogleGenerativeAI({
    apiKey: env.GEMINI_API_KEY,
  });

  private model = this.google.textEmbeddingModel('text-embedding-004');
  private cache = new Map<string, number[]>();

  /**
   * Generates an embedding for a single text string.
   */
  async generateEmbedding(text: string): Promise<number[]> {
    const trimmed = text.trim();
    if (this.cache.has(trimmed)) {
      return this.cache.get(trimmed)!;
    }

    try {
      const { embedding } = await embed({
        model: this.model,
        value: trimmed,
      });
      
      // Prevent memory leak by clearing cache if it exceeds 1000 items
      if (this.cache.size >= 1000) {
        this.cache.clear();
      }
      this.cache.set(trimmed, embedding);
      return embedding;
    } catch (error) {
      console.error('Embedding generation failed:', error);
      throw error;
    }
  }

  /**
   * Generates embeddings for multiple text strings in a batch.
   */
  async generateEmbeddingsBatch(texts: string[]): Promise<number[][]> {
    if (texts.length === 0) return [];

    try {
      // Simple batching logic - text-embedding-004 supports up to 100 texts per request usually
      const BATCH_SIZE = 100;
      const batches = [];
      for (let i = 0; i < texts.length; i += BATCH_SIZE) {
        batches.push(texts.slice(i, i + BATCH_SIZE));
      }

      const allEmbeddings: number[][] = [];
      for (const batch of batches) {
        const { embeddings } = await embedMany({
          model: this.model,
          values: batch,
        });
        allEmbeddings.push(...embeddings);
      }

      return allEmbeddings;
    } catch (error) {
      console.error('Batch embedding generation failed:', error);
      throw error;
    }
  }

  /**
   * Chunks a long text into smaller, token-efficient pieces.
   * Basic implementation for now - can be improved with semantic chunking.
   */
  chunkText(text: string, maxChars: number = 2000): string[] {
    if (text.length <= maxChars) return [text];

    const chunks: string[] = [];
    let remainingText = text;

    while (remainingText.length > 0) {
      if (remainingText.length <= maxChars) {
        chunks.push(remainingText);
        break;
      }

      let splitIndex = remainingText.lastIndexOf('. ', maxChars);
      if (splitIndex === -1) splitIndex = remainingText.lastIndexOf(' ', maxChars);
      if (splitIndex === -1) splitIndex = maxChars;

      chunks.push(remainingText.substring(0, splitIndex + 1).trim());
      remainingText = remainingText.substring(splitIndex + 1).trim();
    }

    return chunks;
  }
}

export const embeddingService = new EmbeddingService();
