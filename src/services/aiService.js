const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function callGemini(prompt, retries = 3, maxTokens = 1024) {
  if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your_gemini_api_key_here') {
    throw new Error('Please set VITE_GEMINI_API_KEY in your .env file');
  }

  for (let attempt = 0; attempt <= retries; attempt++) {
    const res = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: maxTokens,
        },
      }),
    });

    if (res.status === 429 && attempt < retries) {
      await delay(2000 * Math.pow(2, attempt));
      continue;
    }

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message || 'Gemini API error');
    }

    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  }
}

function parseJSON(result, fallback) {
  try {
    const cleaned = result.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    return fallback;
  }
}

export const aiService = {
  /**
   * Classify file content into categories
   */
  async classifyFile(fileName, fileType, fileSize) {
    const prompt = `You are a file classification AI. Given the following file metadata, classify it into ONE of these categories: Document, Image, Video, Audio, Code, Archive, Spreadsheet, Presentation, Database, Other.

Also provide a confidence score (0-100) and a brief reason.

File name: ${fileName}
File type: ${fileType}
File size: ${fileSize} bytes

Respond in valid JSON format only:
{"category": "...", "confidence": 0, "reason": "..."}`;

    const result = await callGemini(prompt);
    return parseJSON(result, { category: 'Other', confidence: 50, reason: 'Could not parse AI response' });
  },

  /**
   * Generate smart tags for a file
   */
  async generateTags(fileName, fileType, fileSize) {
    const prompt = `You are a smart file tagging AI. Given the following file metadata, suggest 3-6 relevant tags for organizing and searching this file.

File name: ${fileName}
File type: ${fileType}
File size: ${fileSize} bytes

Respond in valid JSON format only:
{"tags": ["tag1", "tag2", "tag3"]}`;

    const result = await callGemini(prompt);
    return parseJSON(result, { tags: [fileType.split('/')[0], 'uploaded'] });
  },

  /**
   * Detect potential duplicates based on file metadata
   */
  async detectDuplicates(newFile, existingFiles) {
    if (!existingFiles || existingFiles.length === 0) {
      return { duplicates: [], hasDuplicates: false };
    }

    const existingList = existingFiles
      .map((f, i) => `${i + 1}. Name: "${f.file_name}", Type: ${f.mime_type}, Size: ${f.file_size} bytes`)
      .join('\n');

    const prompt = `You are a duplicate file detection AI. Analyze whether the new file might be a duplicate of any existing files based on their metadata.

New file:
Name: "${newFile.name}"
Type: ${newFile.type}
Size: ${newFile.size} bytes

Existing files:
${existingList}

Respond in valid JSON format only:
{"hasDuplicates": true/false, "duplicates": [{"index": 1, "similarity": 85, "reason": "..."}]}

If no duplicates, return: {"hasDuplicates": false, "duplicates": []}`;

    const result = await callGemini(prompt);
    return parseJSON(result, { duplicates: [], hasDuplicates: false });
  },

  /**
   * Recommend access settings for sharing
   */
  async recommendAccess(fileName, fileType, fileSize) {
    const prompt = `You are a file security AI advisor. Based on the file metadata, recommend appropriate sharing/access settings.

File name: ${fileName}
File type: ${fileType}
File size: ${fileSize} bytes

Consider: sensitivity of the file type, common use cases, security best practices.

Respond in valid JSON format only:
{
  "requirePassword": true/false,
  "suggestedExpiryDays": 7,
  "suggestedDownloadLimit": 5,
  "securityLevel": "low/medium/high",
  "reason": "Brief explanation of recommendations"
}`;

    const result = await callGemini(prompt);
    return parseJSON(result, {
      requirePassword: true,
      suggestedExpiryDays: 7,
      suggestedDownloadLimit: 5,
      securityLevel: 'medium',
      reason: 'Default security settings applied',
    });
  },

  /**
   * Get a smart summary/description of the file
   */
  async getFileSummary(fileName, fileType, fileSize) {
    const prompt = `You are a helpful AI assistant. Provide a brief, one-sentence description of what this file likely contains based on its metadata.

File name: ${fileName}
File type: ${fileType}
File size: ${fileSize} bytes

Respond in valid JSON format only:
{"summary": "..."}`;

    const result = await callGemini(prompt);
    return parseJSON(result, { summary: `${fileType} file` });
  },

  /**
   * Smart search across files using AI
   */
  async smartSearch(query, files) {
    if (!files || files.length === 0) return { results: [] };

    const fileList = files
      .map((f, i) => `${i}. "${f.file_name}" (${f.mime_type}, ${f.file_size} bytes, category: ${f.category || 'unknown'}, tags: ${f.tags?.join(', ') || 'none'})`)
      .join('\n');

    const prompt = `You are a smart file search AI. Given a user's search query and a list of files, return the indices of files that best match the query. Consider file names, types, categories, tags, and semantic meaning.

Search query: "${query}"

Files:
${fileList}

Respond in valid JSON format only:
{"results": [{"index": 0, "relevance": 95, "reason": "..."}]}
Return only matching files, sorted by relevance (highest first). If no files match, return {"results": []}`;

    const result = await callGemini(prompt);
    return parseJSON(result, { results: [] });
  },

  /**
   * Anomaly detection - detect suspicious activity patterns
   */
  async detectAnomalies(activities) {
    if (!activities || activities.length === 0) return { anomalies: [], hasAnomalies: false };

    const activityList = activities
      .slice(0, 30) // limit to recent 30
      .map((a, i) => `${i + 1}. [${a.created_at}] ${a.action}: ${a.file_name || 'N/A'} - ${a.details} (IP: ${a.ip})`)
      .join('\n');

    const prompt = `You are a security anomaly detection AI. Analyze the following file activity log and identify any suspicious patterns such as:
- Unusual bulk downloads or deletions
- Access from unusual IPs
- Rapid successive operations
- Unusual file access patterns

Activities:
${activityList}

Respond in valid JSON format only:
{"hasAnomalies": true/false, "anomalies": [{"type": "...", "severity": "low/medium/high", "description": "..."}], "summary": "Brief overall assessment"}`;

    const result = await callGemini(prompt);
    return parseJSON(result, { anomalies: [], hasAnomalies: false, summary: 'No anomalies detected' });
  },

  /**
   * Auto-generate file description
   */
  async generateDescription(fileName, fileType, fileSize, category, tags) {
    const prompt = `You are a helpful AI. Generate a brief, professional 2-3 sentence description for this file:

File: ${fileName}
Type: ${fileType}
Size: ${fileSize} bytes
Category: ${category || 'unknown'}
Tags: ${tags?.join(', ') || 'none'}

Respond in valid JSON format only:
{"description": "..."}`;

    const result = await callGemini(prompt);
    return parseJSON(result, { description: `A ${fileType} file named ${fileName}` });
  },

  /**
   * Deep document explanation — explains what the file likely contains, its purpose,
   * how it might be used, and provides context about the file type
   */
  async explainDocument(fileName, fileType, fileSize, category, tags, textContent) {
    const contentHint = textContent
      ? `\n\nHere is a snippet of the file content (first 2000 chars):\n${textContent.slice(0, 2000)}`
      : '';

    const prompt = `You are an expert document analyst AI. Given the following file, provide a comprehensive explanation.

File name: ${fileName}
File type: ${fileType}
File size: ${fileSize} bytes
Category: ${category || 'unknown'}
Tags: ${tags?.join(', ') || 'none'}${contentHint}

Provide a thorough explanation including:
1. What this document likely contains
2. Its probable purpose and use case
3. Who typically creates/uses this type of file
4. Key characteristics of this file format
5. Any actionable suggestions for the user

Respond in valid JSON format only:
{
  "title": "Brief title for this explanation",
  "overview": "2-3 sentence high-level overview",
  "contents": "What this file likely contains (2-3 sentences)",
  "purpose": "Probable purpose and use case",
  "audience": "Who typically uses files like this",
  "format_info": "Key characteristics of the file format",
  "suggestions": ["actionable suggestion 1", "suggestion 2", "suggestion 3"],
  "related_types": ["related file type 1", "related file type 2"]
}`;

    const result = await callGemini(prompt, 3, 2048);
    return parseJSON(result, {
      title: fileName,
      overview: `A ${fileType} file.`,
      contents: 'Unable to determine contents from metadata alone.',
      purpose: 'General purpose file.',
      audience: 'General users.',
      format_info: `This is a ${fileType} file of size ${fileSize} bytes.`,
      suggestions: ['Download and open the file locally for detailed analysis'],
      related_types: [],
    });
  },

  /**
   * Generate an email-friendly summary for sharing a file
   */
  async generateEmailSummary(fileName, fileType, fileSize, shareLink) {
    const prompt = `You are a professional email writing AI. Generate a brief, polite email body for sharing a file with someone. Keep it concise and professional.

File being shared: ${fileName}
File type: ${fileType}
File size: ${fileSize} bytes
Share link code: ${shareLink}

Respond in valid JSON format only:
{
  "subject": "Email subject line",
  "body": "Email body text (2-3 short paragraphs, include the share link code, mention they can access it on the SecureVault platform)"
}`;

    const result = await callGemini(prompt);
    return parseJSON(result, {
      subject: `Shared file: ${fileName}`,
      body: `Hi,\n\nI've shared a file with you via SecureVault.\n\nFile: ${fileName}\nShare code: ${shareLink}\n\nYou can access it at the SecureVault share page.\n\nBest regards`,
    });
  },

  /**
   * Chat with AI about a document — conversational Q&A
   */
  async chatAboutDocument(fileName, fileType, fileSize, category, question, textContent) {
    const contentHint = textContent
      ? `\n\nFile content snippet (first 2000 chars):\n${textContent.slice(0, 2000)}`
      : '';

    const prompt = `You are a helpful AI assistant that answers questions about files. A user is asking about their file.

File: ${fileName}
Type: ${fileType}
Size: ${fileSize} bytes
Category: ${category || 'unknown'}${contentHint}

User question: "${question}"

Provide a helpful, concise answer. If you cannot determine the answer from the available metadata, say so honestly and suggest what the user could do to find out.

Respond in valid JSON format only:
{"answer": "Your helpful response here", "confidence": "high/medium/low"}`;

    const result = await callGemini(prompt);
    return parseJSON(result, { answer: 'I could not analyze this document. Please try again.', confidence: 'low' });
  },
};
