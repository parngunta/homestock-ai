import { Router } from 'express';
import { AuthRequest } from '../middleware/auth';
import { AIService } from '../services/ai-service';

export const voiceRouter = Router();

voiceRouter.post('/process', async (req: AuthRequest, res) => {
  const { transcript } = req.body;

  if (!transcript) {
    return res.status(400).json({ error: 'Transcript is required' });
  }

  try {
    const prompt = `Extract inventory information from this voice transcript. Return a JSON object with: name (string), quantity (number), unit (string, one of: PIECE, ROLL, PACK, BOTTLE, CAN, BOX, BAG, KG, LITER, ML, GRAM, OUNCE, POUND, GALLON), action (one of: "add", "remove", "check"). 

Transcript: "${transcript}"

Return only valid JSON, no other text.`;

    const response = await AIService.chat(prompt);

    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return res.json({ transcript, extracted: parsed });
      }
    } catch {
      // Return raw response if JSON parsing fails
    }

    return res.json({ transcript, extracted: null, raw: response });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Voice processing error' });
  }
});