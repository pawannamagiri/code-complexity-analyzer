let selectedCode = '';
let analysisInProgress = false;

chrome.runtime.onInstalled.addListener(() => {
  console.log('AI Code Complexity Analyzer installed');
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'setSelectedCode') {
    selectedCode = request.code;
    sendResponse({ status: 'code stored' });
  }
  
  else if (request.action === 'getSelectedCode') {
    sendResponse({ code: selectedCode });
  }
  
  else if (request.action === 'analyzeCode') {
    if (analysisInProgress) {
      sendResponse({ error: 'Analysis already in progress' });
      return;
    }
    
    analyzeWithMistral(request.code, request.language, request.apiKey)
      .then(result => sendResponse({ result }))
      .catch(error => sendResponse({ error: error.message }));
    
    return true;
  }
});

async function analyzeWithMistral(code, language, apiKey) {
  if (!apiKey) {
    throw new Error('API key not provided');
  }
  
  if (!code || code.trim().length < 5) {
    throw new Error('Code too short or empty');
  }
  
  if (code.length > 8000) {
    throw new Error('Code too long (max 8000 characters)');
  }
  
  analysisInProgress = true;
  
  try {
    const prompt = createAnalysisPrompt(code, language);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    
    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'mistral-large-latest',
        messages: [
          {
            role: 'system',
            content: 'You are an expert code complexity analyzer. Analyze the given code and return ONLY a valid JSON response with no additional text, markdown, or formatting. Be precise and concise.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 600
      }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      let errorMessage = `API Error ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error?.message || errorMessage;
      } catch (e) {}
      
      if (response.status === 401) {
        throw new Error('Invalid API key - check your Mistral API key');
      } else if (response.status === 429) {
        throw new Error('Rate limit exceeded - please wait a moment');
      } else if (response.status >= 500) {
        throw new Error('Mistral API temporarily unavailable');
      }
      
      throw new Error(errorMessage);
    }
    
    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response format from API');
    }
    
    const content = data.choices[0].message.content.trim();
    
    try {
      // Clean the response - remove any markdown or extra text
      let cleanContent = content.trim();
      
      // Remove common markdown patterns
      cleanContent = cleanContent.replace(/```json\s*/g, '');
      cleanContent = cleanContent.replace(/```\s*/g, '');
      cleanContent = cleanContent.replace(/^json\s*/g, '');
      
      // Find JSON object if embedded in text
      const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanContent = jsonMatch[0];
      }
      
      console.log('Attempting to parse:', cleanContent);
      const parsed = JSON.parse(cleanContent);
      
      // Validate required fields
      if (!parsed.complexity) {
        throw new Error('Missing complexity field');
      }
      
      return {
        complexity: parsed.complexity || 'Unknown',
        space_complexity: parsed.space_complexity || null,
        language: parsed.language || language,
        explanation: parsed.explanation || 'No explanation provided',
        key_operations: Array.isArray(parsed.key_operations) ? parsed.key_operations : [],
        suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : []
      };
      
    } catch (parseError) {
      console.error('Parse error:', parseError, 'Raw content:', content);
      
      // Fallback: try to extract complexity from text
      const complexityMatch = content.match(/O\([^)]+\)/);
      const fallbackComplexity = complexityMatch ? complexityMatch[0] : 'O(?)';
      
      // Try to extract explanation
      const sentences = content.split(/[.!?]+/).filter(s => s.length > 10);
      const fallbackExplanation = sentences.length > 0 ? sentences[0].trim() + '.' : 'Analysis completed but response format was unexpected.';
      
      return {
        complexity: fallbackComplexity,
        space_complexity: null,
        language: language,
        explanation: fallbackExplanation.substring(0, 200),
        key_operations: [],
        suggestions: ['Raw AI response parsing failed - try again']
      };
    }
    
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Request timeout - analysis took too long');
    }
    throw error;
  } finally {
    analysisInProgress = false;
  }
}

function createAnalysisPrompt(code, language) {
  return `You are an expert code complexity analyzer. Analyze this ${language} code and respond with ONLY valid JSON in exactly this format:

{"complexity":"O(n²)","space_complexity":"O(n)","language":"${language}","explanation":"Brief explanation under 150 chars","key_operations":["operation1","operation2"],"suggestions":["suggestion1","suggestion2"]}

CRITICAL ANALYSIS RULES:
- Consider ALL hidden costs of operations:
  * String slicing s[1:] costs O(k) where k is slice length
  * String concatenation + costs O(k) where k is total string length  
  * List operations may copy entire arrays
  * Recursive calls accumulate costs across all calls
- For recursive algorithms: multiply per-call cost by number of calls
- Example: n recursive calls each doing O(k) work = O(n*k) total
- Don't just count recursive calls - analyze what each call does
- Be precise about worst-case scenarios

Return ONLY the JSON object, no markdown, no backticks, no other text.

Code to analyze:
${code}

JSON response:`;
}