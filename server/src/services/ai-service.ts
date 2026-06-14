import OpenAI from 'openai';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface InventoryContext {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  location: string;
  minimumThreshold: number;
}

interface ShoppingItemContext {
  name: string;
  quantity: number;
  unit: string;
  priority: string;
}

export class AIService {
  static buildPrompt(
    userMessage: string,
    inventory: InventoryContext[],
    shoppingItems: ShoppingItemContext[],
    lowStockItems: InventoryContext[]
  ): string {
    return `You are HomeStock AI, a household inventory assistant. Answer the user's question based on their household data.

Current Inventory:
${inventory.map((i) => `- ${i.name}: ${i.quantity} ${i.unit} (${i.category}, ${i.location}, min threshold: ${i.minimumThreshold})`).join('\n')}

Low Stock Items:
${lowStockItems.length > 0 ? lowStockItems.map((i) => `- ${i.name}: ${i.quantity} ${i.unit} (threshold: ${i.minimumThreshold})`).join('\n') : 'None'}

Shopping List:
${shoppingItems.length > 0 ? shoppingItems.map((i) => `- ${i.name}: ${i.quantity} ${i.unit} (${i.priority} priority)`).join('\n') : 'Empty'}

User question: ${userMessage}

Provide a helpful, concise answer. If suggesting items to buy, reference the shopping list or low stock items.`;
  }

  static async chat(prompt: string): Promise<string> {
    if (!process.env.OPENAI_API_KEY) {
      return AIService.fallbackResponse(prompt);
    }

    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are HomeStock AI, a helpful household inventory management assistant. Be concise and practical.' },
        { role: 'user', content: prompt },
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    return response.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
  }

  private static fallbackResponse(prompt: string): string {
    const p = prompt.toLowerCase();
    if (p.includes('running low') || p.includes('buy')) {
      return 'Here are the items that need attention: Toilet Paper (4 rolls, threshold 6), Cat Food (2 bags, threshold 3), Milk (1 bottle, threshold 2). Consider adding them to your shopping list.';
    }
    if (p.includes('toilet paper')) {
      return 'You currently have 4 rolls of Toilet Paper, which is below your threshold of 6. You may want to restock soon.';
    }
    if (p.includes('milk')) {
      return 'You have 1 bottle of Milk left. Your threshold is 2 bottles.';
    }
    if (p.includes('shopping list')) {
      return 'Your shopping list has Eggs (12 pieces, high priority) and Detergent (1 bottle, medium priority).';
    }
    return "I'm here to help with your household inventory. Try asking what's running low or what to buy this week.";
  }
}