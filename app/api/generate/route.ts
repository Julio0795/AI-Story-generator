// File: app/api/generate/route.ts

import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// --- NEW: Helper function to translate slider value to AI instruction ---
function getStyleDescription(level: number): string {
  switch (level) {
    case 1:
      return 'using simple, clear, and easy-to-read language suitable for a young audience.';
    case 2:
      return 'using straightforward language with a slightly descriptive flair.';
    case 3:
      return 'using standard, engaging language with a good balance of description and action.';
    case 4:
      return 'using sophisticated vocabulary and more complex sentence structures for a literary feel.';
    case 5:
      return 'using highly technical, verbose, and ornate language with intricate sentence structures, like a classic piece of literature.';
    default:
      return 'using standard, engaging language.';
  }
}

export async function POST(request: Request) {
  try {
    const { prompt, language, technicalLevel } = await request.json();

    if (!prompt || !language || technicalLevel === undefined) {
      return NextResponse.json({ error: 'Prompt, language, and technicalLevel are required' }, { status: 400 });
    }

    const styleDescription = getStyleDescription(Number(technicalLevel));

    // --- NEW: System prompt now includes the style instruction ---
    const systemPrompt = `
    You are a master storyteller. Create a short, engaging paragraph of a story (around 100 words) based on the user's prompt. 
    Your tone should be epic, mysterious, or thrilling.
    You MUST write the story ${styleDescription}
    You must respond in the ${language} language. Your entire response must be a valid JSON object with the following structure: {"story": "...", "choice1": "...", "choice2": "..."}.
    Do not include any other text outside of the JSON object.
    `;

    console.log(`Generating story in ${language} with style level ${technicalLevel}...`);
    const storyResponse = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
    });

    const storyContent = storyResponse.choices[0].message.content;
    if (!storyContent) throw new Error('Failed to generate story content.');

    const { story, choice1, choice2 } = JSON.parse(storyContent);

    const imagePrompt = `${story}, cinematic, digital painting, atmospheric, concept art`;
    
    console.log('Generating image...');
    const imageResponse = await openai.images.generate({
      model: 'dall-e-3',
      prompt: imagePrompt,
      n: 1,
      size: '1024x1024',
      quality: 'standard',
    });

    const imageUrl = imageResponse.data[0].url;
    if (!imageUrl) throw new Error('Failed to generate image URL.');

    console.log('Generation complete!');
    return NextResponse.json({
      story,
      choice1,
      choice2,
      imageUrl,
    });

  } catch (error) {
    console.error('Error in generation API:', error);
    return NextResponse.json({ error: 'Failed to generate story. Please try again.' }, { status: 500 });
  }
}