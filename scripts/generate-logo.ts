import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
import path from 'path';

async function generateLogo() {
  console.log('Generating CodeCollab logo...');

  const zai = await ZAI.create();

  const response = await zai.images.generations.create({
    prompt: 'Professional modern logo for code collaboration platform "CodeCollab", minimalist design, code brackets {} and </> symbols, orange and pink gradient colors, clean geometric shapes, white background, tech company branding style, vector-like quality',
    size: '1024x1024'
  });

  const imageBase64 = response.data[0].base64;
  const buffer = Buffer.from(imageBase64, 'base64');

  // Save to public folder
  const outputPath = path.join(process.cwd(), 'public', 'logo.png');
  fs.writeFileSync(outputPath, buffer);

  console.log(`✓ Logo generated successfully: ${outputPath}`);
  return outputPath;
}

generateLogo().catch(console.error);
