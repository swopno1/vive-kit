import { PromptModule } from '../../types';

export const leadExtractor: PromptModule = {
  id: 'lead-extractor',
  name: 'Lead Data Extraction',
  version: '1.0.0',
  description: 'Extracting structured lead contact information with confidence scoring.',
  priority: 35,
  content: (config) => {
    if (config.task !== 'analyze') return '';

    return `### LEAD DATA EXTRACTION WITH CONFIDENCE SCORING:

Extract the following lead contact information from the conversation.
For EACH field, provide:
1. The extracted value (or null if not found)
2. A confidence score (0.0 to 1.0) indicating extraction certainty
3. The source where you found this information (e.g., "email signature", "conversation mention", etc.)

**Fields to Extract:**

1. **firstName**: First name of the contact
   - Confidence: 0.0 (not found) to 1.0 (explicitly stated)
   - Source: Where did you find this? (e.g., "greeting", "signature", "body mention")

2. **lastName**: Last name/family name of the contact
   - Confidence: 0.0 to 1.0
   - Source: Where did you find this?

3. **email**: Email address of the contact
   - Confidence: 0.0 to 1.0
   - Source: Where did you find this? (e.g., "email from line", "signature", "mention in text")

4. **phone**: Phone number of the contact
   - Confidence: 0.0 to 1.0
   - Source: Where did you find this? (e.g., "signature", "body text")

5. **company**: Company or organization name
   - Confidence: 0.0 to 1.0
   - Source: Where did you find this? (e.g., "email domain", "self-mention", "email signature")

6. **serviceInterest**: Services or solutions the contact is interested in
   - Return as an array of strings (e.g., ["web development", "SEO", "consulting"])
   - Confidence: 0.0 to 1.0 for overall array accuracy
   - Source: Where did you find this? (e.g., "explicit request", "problem description", "inquiry type")

**Extraction Rules:**
- If information is not present, set value to null (not empty string)
- Confidence scores reflect your certainty: 0.9+ = very confident, 0.7-0.9 = moderately confident, <0.7 = uncertain
- For names: if only one name given, place in firstName and set lastName to null
- For email: only extract valid email formats
- For phone: extract any phone-like format but include country code if available
- For company: infer from email domain if no explicit mention (e.g., "john@acme.com" → company = "Acme")
- For serviceInterest: extract all services/products mentioned, explicitly requested, or implied by problem statement
- Calculate overallConfidence as the average of all field confidences

**Example Output Structure:**
\`\`\`json
{
  "firstName": {
    "value": "John",
    "confidence": 0.95,
    "source": "email greeting and signature"
  },
  "lastName": {
    "value": "Smith",
    "confidence": 0.95,
    "source": "email signature"
  },
  "email": {
    "value": "john.smith@acme.com",
    "confidence": 1.0,
    "source": "from email address"
  },
  "phone": {
    "value": "+1-555-123-4567",
    "confidence": 0.8,
    "source": "signature footer"
  },
  "company": {
    "value": "Acme Corporation",
    "confidence": 0.9,
    "source": "email domain and signature"
  },
  "serviceInterest": {
    "values": ["web development", "API integration", "consulting"],
    "confidence": 0.85,
    "source": "explicit request in conversation body"
  },
  "overallConfidence": 0.91
}
\`\`\`

**Key Requirements:**
- Be conservative with confidence scores; only give 0.95+ for explicitly stated information
- Inferred information (e.g., company from email domain) should be 0.7-0.85
- If multiple names are given, prioritize the contact person's name (not company representatives)
- Service interests should be concrete services/products, not generic phrases`;
  }
};
