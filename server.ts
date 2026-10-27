import express from 'express';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { GoogleGenAI, Modality } from '@google/genai';
import dotenv from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';
import { generateSynthesizedChristianArt, editSynthesizedChristianImage } from './src/services/christianArtGenerator.ts';

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Enable JSON payloads up to 50MB for audio/image/video transfers
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Persistent media directory for videos and photos (saved on disk for permanent availability)
const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Serve /uploads with HTTP Range support for video seeking
app.use('/uploads', express.static(UPLOADS_DIR, {
  setHeaders: (res) => {
    res.setHeader('Accept-Ranges', 'bytes');
  }
}));

// Endpoint for permanent video and image uploads from device gallery
app.post('/api/media/upload', async (req, res) => {
  try {
    const { filename, dataUrl, mimeType } = req.body;
    if (!dataUrl || typeof dataUrl !== 'string') {
      return res.status(400).json({ error: 'dataUrl es requerido.' });
    }

    // Extract base64 payload
    const matches = dataUrl.match(/^data:([A-Za-z0-9\-+/]+);base64,(.+)$/);
    let buffer: Buffer;
    let detectedMime = mimeType || 'application/octet-stream';

    if (matches && matches.length === 3) {
      detectedMime = matches[1];
      buffer = Buffer.from(matches[2], 'base64');
    } else {
      buffer = Buffer.from(dataUrl, 'base64');
    }

    // Determine extension
    let ext = 'bin';
    if (filename && filename.includes('.')) {
      ext = filename.split('.').pop()?.toLowerCase() || 'bin';
    } else if (detectedMime.includes('mp4')) {
      ext = 'mp4';
    } else if (detectedMime.includes('webm')) {
      ext = 'webm';
    } else if (detectedMime.includes('quicktime') || detectedMime.includes('mov')) {
      ext = 'mov';
    } else if (detectedMime.includes('jpeg') || detectedMime.includes('jpg')) {
      ext = 'jpg';
    } else if (detectedMime.includes('png')) {
      ext = 'png';
    } else if (detectedMime.includes('webp')) {
      ext = 'webp';
    }

    // Generate safe unique filename
    const safeBaseName = (filename || 'media')
      .replace(/[^a-zA-Z0-9_\-]/g, '_')
      .slice(0, 30);
    const uniqueFileName = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}_${safeBaseName}.${ext}`;
    const targetFilePath = path.join(UPLOADS_DIR, uniqueFileName);

    await fs.promises.writeFile(targetFilePath, buffer);

    const publicUrl = `/uploads/${uniqueFileName}`;
    const sizeMb = Number((buffer.length / (1024 * 1024)).toFixed(2));

    return res.json({
      success: true,
      url: publicUrl,
      filename: uniqueFileName,
      sizeMb,
      mimeType: detectedMime
    });
  } catch (error: any) {
    console.error('Error saving media upload:', error);
    return res.status(500).json({ error: 'Error al guardar el archivo multimedia en el servidor.' });
  }
});

// Shared server-side Gemini client
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

function sanitizeErrorMessage(error: any): string {
  const msg = typeof error === 'string' ? error : error?.message || '';
  if (msg.includes('503') || msg.includes('high demand') || msg.includes('UNAVAILABLE') || msg.includes('Timeout')) {
    return 'El servicio de IA está experimentando alta demanda momentáneamente. Por favor, reintenta tu consulta en unos segundos.';
  }
  if (msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED')) {
    return 'Se ha alcanzado temporalmente el límite de consultas por minuto. Por favor, espera un instante antes de continuar.';
  }
  if (msg.includes('SAFETY') || msg.includes('blocked')) {
    return 'La consulta no pudo ser completada debido a las políticas de seguridad de contenido.';
  }
  return 'Ocurrió una dificultad al conectar con el asistente de IA. Por favor, intenta nuevamente.';
}

async function generateWithTimeout(model: string, contents: any, config: any, timeoutMs: number = 10000) {
  let timeoutHandle: any;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutHandle = setTimeout(() => {
      reject(new Error(`Timeout after ${timeoutMs}ms`));
    }, timeoutMs);
  });

  try {
    const res = await Promise.race([
      ai.models.generateContent({ model, contents, config }),
      timeoutPromise
    ]);
    clearTimeout(timeoutHandle);
    return res as any;
  } catch (err) {
    clearTimeout(timeoutHandle);
    throw err;
  }
}

const THEOLOGICAL_SYSTEM_PROMPT = `Eres el Mentor Espiritual, Investigador Bíblico y Consejero Pastoral de la red social cristiana adventista "A PRUEBA DE FUEGO".

PRINCIPIOS FUNDAMENTALES DE RESPUESTA:
1. FIDELIDAD Y PRECISIÓN BÍBLICA:
   - Responde siempre fundamentado en las Sagradas Escrituras (indicando la versión cuando sea relevante, preferiblemente Reina-Valera 1960).
   - NUNCA inventes libros, capítulos, versículos, citas ni hechos bíblicos.
   - Cita referencias con precisión exacta (Libro capítulo:versículo). Si no tienes certeza de una cita textual exacta de memoria, acláralo expresamente indicando que es una paráfrasis o resumen y no una transcripción literal.
   - Explica los textos en su contexto histórico, gramatical y literario.

2. EQUILIBRIO DOCTRINAL Y RESPETO CRISTIANO:
   - Distingue con total transparencia entre:
     a) El texto bíblico directo.
     b) La explicación contextual y exegética.
     c) Las doctrinas distintivas de la Iglesia Adventista del Séptimo Día (como el reposo en el sábado bíblico según el 4to mandamiento, la segunda venida visible e inminente de Cristo, el ministerio de Cristo en el santuario celestial, la mayordomía integral de la salud, y la salvación únicamente por gracia mediante la fe).
     d) Las diversas interpretaciones de otras denominaciones cristianas históricas, explicándolas siempre con respeto, equilibrio y cortesía fraternal, sin insultar, descalificar ni despreciar a nadie.
   - Si un tema es motivo de debate eclesiástico, expón las posturas con serenidad y base bíblica sin fingir un consenso absoluto donde no existe.

3. HUMILDAD Y LÍMITES ESPIRITUALES:
   - NUNCA afirmes tener revelación directa de Dios, autoridad profética ni inspiración divina propia. Eres un instrumento de asistencia y estudio cristiano creado para bendición y edificación.
   - Reconoce con humildad las limitaciones: si una pregunta teológica o histórica no tiene una respuesta concluyente en la Biblia, admítelo con honestidad («La Biblia no especifica este detalle...»).
   - NUNCA inventes datos históricos, autores, fechas o fuentes académicas para aparentar seguridad.

4. TONO PASTORAL Y LENGUAJE:
   - Comunícate en español claro, cálido, comprensible, reverente y edificante para la juventud.
   - Enfócate en brindar esperanza, fe en las promesas divinas y aplicaciones prácticas para la vida diaria del joven cristiano en sus estudios, trabajo, familia y servicio misionero.`;

// ============================================================================
// 1. GEMINI MULTI-TURN CHATBOT (gemini-4-argon, gemini-3.8-flash, gemini-3.1-flash-lite)
// ============================================================================
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { prompt, history = [], model = 'gemini-3.8-flash', systemInstruction, toolMode } = req.body;
    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return res.status(400).json({ error: 'El mensaje es requerido.' });
    }

    const validModels = ['gemini-4-argon', 'gemini-3.8-flash', 'gemini-3.1-flash-lite'];
    let selectedModel = validModels.includes(model) ? model : 'gemini-3.8-flash';

    let activeSystemInstruction = systemInstruction || THEOLOGICAL_SYSTEM_PROMPT;

    // Herramientas especializadas de estudio
    if (toolMode === 'exegesis') {
      activeSystemInstruction += `\n\n[MODO HERRAMIENTA ACTIVADO: EXÉGESIS Y CONTEXTO BÍBLICO]
Estructura tu respuesta en 4 secciones claras:
1. Pasaje y Traducción (texto exacto verificado).
2. Contexto Histórico, Cultural y Geográfico (quién escribió, a quién y situación histórica).
3. Significado y Palabras Clave (términos hebreos o griegos destacados si corresponde).
4. Aplicación Práctica para la Vida Juvenil Hoy.`;
    } else if (toolMode === 'sermon') {
      activeSystemInstruction += `\n\n[MODO HERRAMIENTA ACTIVADO: BOSQUEJO HOMILÉTICO / SERMÓN JA]
Estructura un bosquejo homilético completo para culto de jóvenes o predicación:
- TÍTULO: Sugestivo y memorable.
- TEXTO CLAVE: Pasaje bíblico central.
- PROPÓSITO GENERAL Y ESPECÍFICO.
- INTRODUCCIÓN: Conexión o pregunta que capture la atención.
- CUERPO DEL MENSAJE (3 puntos homiléticos con versículo de apoyo y lección para cada uno).
- ILUSTRACIÓN O TESTIMONIO SUGERIDO.
- CONCLUSIÓN Y LLAMADO AL CORAZÓN.`;
    } else if (toolMode === 'devotional') {
      activeSystemInstruction += `\n\n[MODO HERRAMIENTA ACTIVADO: DEVOCIONAL JUVENIL]
Escribe un devocional juvenil inspirador y cercano:
- Título inspirador.
- Versículo lema del día.
- Historia breve, anécdota o metáfora de la vida diaria.
- Reflexión espiritual profunda.
- Oración breve guiada.
- Reto de fe práctico para cumplir durante el día.`;
    } else if (toolMode === 'prayer') {
      activeSystemInstruction += `\n\n[MODO HERRAMIENTA ACTIVADO: GUÍA DE ORACIÓN Y CONSUELO PASTORAL]
Ofrece consuelo amoroso fundamentado en las promesas bíblicas, seguido de una oración pastoral escrita en primera persona del plural con la que el joven pueda orar a Dios, con reverencia, confianza en Su gracia y paz para su corazón.`;
    } else if (toolMode === 'topical') {
      activeSystemInstruction += `\n\n[MODO HERRAMIENTA ACTIVADO: ESTUDIO TEMÁTICO COMPARATIVO]
Presenta una cadena temática sistemática con 3 a 5 versículos clave que aborden el tema de manera progresiva. Para cada texto incluye:
- Cita bíblica exacta.
- Qué enseña este texto respecto al tema.
- Síntesis doctrinal final adventista y aplicación cristiana.`;
    }

    const contents = [
      ...history.map((msg: { role: string; content: string }) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      })),
      {
        role: 'user',
        parts: [{ text: prompt.trim() }],
      },
    ];

    let replyText = '';
    let usedModel = selectedModel;

    try {
      const response = await generateWithTimeout(
        selectedModel,
        contents,
        {
          systemInstruction: activeSystemInstruction,
          temperature: 0.7,
        },
        selectedModel === 'gemini-3.1-flash-lite' ? 20000 : 25000
      );
      replyText = response.text || 'Que la paz y la gracia del Señor Jesús guarden tu mente y corazón.';
    } catch (primaryError: any) {
      console.warn(`Primary model ${selectedModel} timed out or failed, evaluating fast fallback:`, primaryError?.message || primaryError);
      
      // Si el modelo principal tarda demasiado o falla, recurrimos a gemini-3.1-flash-lite
      if (selectedModel !== 'gemini-3.1-flash-lite') {
        try {
          console.info('Executing fast fallback with gemini-3.1-flash-lite...');
          const fallbackResponse = await generateWithTimeout(
            'gemini-3.1-flash-lite',
            contents,
            {
              systemInstruction: activeSystemInstruction,
              temperature: 0.7,
            },
            20000
          );
          replyText = fallbackResponse.text || 'Que la paz de Dios guarde tu corazón.';
          usedModel = 'gemini-3.1-flash-lite';
        } catch (fallbackError: any) {
          throw primaryError;
        }
      } else {
        throw primaryError;
      }
    }

    res.json({
      reply: replyText,
      model: usedModel,
    });
  } catch (error: any) {
    console.error('Error in /api/ai/chat:', error);
    const friendlyError = sanitizeErrorMessage(error);
    res.status(500).json({ error: friendlyError });
  }
});

// ============================================================================
// 2. GOOGLE SEARCH GROUNDING (gemini-3.8-flash + googleSearch tool)
// ============================================================================
app.post('/api/ai/search-grounding', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'La consulta es requerida.' });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: 'Eres un investigador y bibliotecario cristiano adventista. Proporciona información verificada y reciente usando Google Search.',
        tools: [{ googleSearch: {} }],
      },
    });

    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
    res.json({
      reply: response.text || 'No se obtuvieron resultados de búsqueda.',
      sources: groundingMetadata?.groundingChunks || [],
      webSearchQueries: groundingMetadata?.webSearchQueries || [],
    });
  } catch (error: any) {
    console.error('Error in /api/ai/search-grounding:', error);
    res.status(500).json({ error: sanitizeErrorMessage(error) });
  }
});

// ============================================================================
// 3. GOOGLE MAPS GROUNDING (gemini-3.8-flash + googleMaps tool)
// ============================================================================
app.post('/api/ai/maps-grounding', async (req, res) => {
  try {
    const { prompt, latitude, longitude } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'La consulta geográfica es requerida.' });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: 'Eres un guía de templos, iglesias adventistas, centros misioneros y campamentos juveniles. Ubica sitios con precisión.',
        tools: [{ googleMaps: {} }],
      },
    });

    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
    res.json({
      reply: response.text || 'No se encontraron ubicaciones para la consulta.',
      mapSources: groundingMetadata?.groundingChunks || [],
    });
  } catch (error: any) {
    console.error('Error in /api/ai/maps-grounding:', error);
    res.status(500).json({ error: sanitizeErrorMessage(error) });
  }
});

// ============================================================================
// 4. CREATE & EDIT IMAGES (Dual Engine: Gemini Nano Banana / Flash Lite + Christian Sacred Art Engine)
// ============================================================================
app.post('/api/ai/generate-image', async (req, res) => {
  try {
    const { prompt, aspectRatio = '1:1', imageSize = '1K', bibleVerse } = req.body;
    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return res.status(400).json({ error: 'El prompt visual es requerido.' });
    }

    let imageUrl = '';
    let usedModel = 'gemini-nano-banana-2.1';
    let engine = 'gemini-nano-banana-2.1';

    // Intento 1: Modelo directo Gemini Nano Banana 2.1 (si la clave tiene cuota)
    try {
      const response = await generateWithTimeout(
        'gemini-nano-banana-2.1',
        { parts: [{ text: prompt.trim() }] },
        {
          imageConfig: {
            aspectRatio: aspectRatio as any,
            imageSize: imageSize as any,
          },
        },
        12000
      );

      const parts = response.candidates?.[0]?.content?.parts || [];
      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
          const mime = part.inlineData.mimeType || 'image/png';
          imageUrl = `data:${mime};base64,${part.inlineData.data}`;
          break;
        }
      }
    } catch (primaryErr: any) {
      console.warn('Primary model gemini-nano-banana-2.1 failed or exceeded free tier quota:', primaryErr?.message || primaryErr);
      
      // Intento 2: Probar gemini-3.1-flash-lite-image
      try {
        const altResponse = await generateWithTimeout(
          'gemini-3.1-flash-lite-image',
          { parts: [{ text: prompt.trim() }] },
          {
            imageConfig: {
              aspectRatio: aspectRatio as any,
            },
          },
          10000
        );

        const altParts = altResponse.candidates?.[0]?.content?.parts || [];
        for (const part of altParts) {
          if (part.inlineData && part.inlineData.data) {
            const mime = part.inlineData.mimeType || 'image/png';
            imageUrl = `data:${mime};base64,${part.inlineData.data}`;
            usedModel = 'gemini-3.1-flash-lite-image';
            engine = 'gemini-3.1-flash-lite-image';
            break;
          }
        }
      } catch (altErr: any) {
        console.warn('Fallback model gemini-3.1-flash-lite-image also exceeded free tier quota (limit 0). Activating Christian Sacred Art Synthesis Engine...');
      }
    }

    // Intento 3: Si ambos modelos de imagen de la API retornan cuota 0 de Free Tier,
    // activamos el motor de síntesis de arte bíblico de alta resolución
    if (!imageUrl) {
      console.info('Synthesizing high-definition Christian biblical artwork for prompt:', prompt);
      const synthResult = await generateSynthesizedChristianArt({
        prompt: prompt.trim(),
        aspectRatio,
        imageSize,
        bibleVerse,
      });

      imageUrl = synthResult.imageUrl;
      usedModel = synthResult.model;
      engine = 'christian-sacred-art-engine';
    }

    res.json({
      imageUrl,
      prompt: prompt.trim(),
      model: usedModel,
      engine,
      aspectRatio,
      imageSize,
    });
  } catch (error: any) {
    console.error('Error in /api/ai/generate-image:', error);
    res.status(500).json({ error: sanitizeErrorMessage(error) });
  }
});

app.post('/api/ai/edit-image', async (req, res) => {
  try {
    const { prompt, base64Image, mimeType = 'image/png', aspectRatio = '1:1' } = req.body;
    if (!prompt || !base64Image) {
      return res.status(400).json({ error: 'Prompt e imagen base64 son requeridos para editar.' });
    }

    const cleanBase64 = base64Image.replace(/^data:[a-zA-Z0-9/]+;base64,/, '');
    let imageUrl = '';
    let usedModel = 'gemini-nano-banana-2.1';
    let engine = 'gemini-nano-banana-2.1';

    // Intento 1: Gemini Nano Banana 2.1
    try {
      const response = await generateWithTimeout(
        'gemini-nano-banana-2.1',
        {
          parts: [
            {
              inlineData: {
                data: cleanBase64,
                mimeType,
              },
            },
            { text: prompt.trim() },
          ],
        },
        {
          imageConfig: {
            aspectRatio: aspectRatio as any,
            imageSize: '1K',
          },
        },
        12000
      );

      const parts = response.candidates?.[0]?.content?.parts || [];
      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
          const mime = part.inlineData.mimeType || 'image/png';
          imageUrl = `data:${mime};base64,${part.inlineData.data}`;
          break;
        }
      }
    } catch (primaryErr: any) {
      console.warn('Direct image editing with nano-banana failed or exceeded free tier quota. Activating Christian Image Editor Engine...');
    }

    // Intento 2: Procesador de edición cristiana con filtros y versículos sobre la imagen original
    if (!imageUrl) {
      const editResult = await editSynthesizedChristianImage({
        prompt: prompt.trim(),
        base64Image,
        aspectRatio,
        mimeType,
      });

      imageUrl = editResult.imageUrl;
      usedModel = editResult.model;
      engine = 'christian-image-editor-engine';
    }

    res.json({
      imageUrl,
      prompt: prompt.trim(),
      model: usedModel,
      engine,
      aspectRatio,
    });
  } catch (error: any) {
    console.error('Error in /api/ai/edit-image:', error);
    res.status(500).json({ error: sanitizeErrorMessage(error) });
  }
});

// ============================================================================
// 5. VIDEO GENERATION & ANIMATION (gemini-omni-1.1-flash via Interactions API)
// ============================================================================
app.post('/api/ai/generate-video', async (req, res) => {
  try {
    const { prompt, base64Image, aspectRatio = '16:9', duration = '5s' } = req.body;
    if (!prompt && !base64Image) {
      return res.status(400).json({ error: 'Se requiere un prompt o una imagen.' });
    }

    const cleanBase64 = base64Image ? base64Image.replace(/^data:[a-zA-Z0-9/]+;base64,/, '') : null;

    let input: any;
    if (cleanBase64) {
      // Image-to-Video: Animar foto
      input = [
        {
          type: 'image',
          mime_type: 'image/png',
          data: cleanBase64,
        },
        {
          type: 'text',
          text: prompt || 'Anima suavemente esta escena con movimiento sutil y reverente.',
        },
      ];
    } else {
      // Text-to-Video
      input = prompt;
    }

    const interaction = await ai.interactions.create({
      model: 'gemini-omni-1.1-flash',
      input,
      background: false,
      store: false,
      stream: false,
      response_format: {
        type: 'video',
        aspect_ratio: aspectRatio === '9:16' ? '9:16' : '16:9',
        duration: duration === '10s' ? '10s' : '5s',
      },
    }, { timeout: 300000 });

    const videoPart = interaction.output_video;
    if (videoPart && videoPart.data) {
      const mime = videoPart.mime_type || 'video/mp4';
      const videoUrl = `data:${mime};base64,${videoPart.data}`;
      return res.json({ videoUrl, prompt, model: 'gemini-omni-1.1-flash' });
    }

    res.status(500).json({ error: 'No se generó el video esperado.' });
  } catch (error: any) {
    console.error('Error in /api/ai/generate-video:', error);
    res.status(500).json({ error: sanitizeErrorMessage(error) });
  }
});

// ============================================================================
// 6. MUSIC GENERATION (lyria-3-clip-preview & lyria-3-pro-preview)
// ============================================================================
app.post('/api/ai/generate-music', async (req, res) => {
  try {
    const { prompt, isFullTrack = false, base64Image } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'La descripción de la música es requerida.' });
    }

    const model = isFullTrack ? 'lyria-3-pro-preview' : 'lyria-3-clip-preview';

    let contents: any;
    if (base64Image) {
      const cleanBase64 = base64Image.replace(/^data:[a-zA-Z0-9/]+;base64,/, '');
      contents = {
        parts: [
          { text: prompt },
          { inlineData: { data: cleanBase64, mimeType: 'image/jpeg' } },
        ],
      };
    } else {
      contents = prompt;
    }

    const responseStream = await ai.models.generateContentStream({
      model,
      contents,
    });

    let audioBase64 = '';
    let lyrics = '';
    let mimeType = 'audio/wav';

    for await (const chunk of responseStream) {
      const parts = chunk.candidates?.[0]?.content?.parts;
      if (!parts) continue;
      for (const part of parts) {
        if (part.inlineData?.data) {
          if (!audioBase64 && part.inlineData.mimeType) {
            mimeType = part.inlineData.mimeType;
          }
          audioBase64 += part.inlineData.data;
        }
        if (part.text && !lyrics) {
          lyrics = part.text;
        }
      }
    }

    if (!audioBase64) {
      return res.status(500).json({ error: 'No se pudo generar el audio musical.' });
    }

    res.json({
      audioBase64,
      lyrics,
      mimeType,
      model,
    });
  } catch (error: any) {
    console.error('Error in /api/ai/generate-music:', error);
    res.status(500).json({ error: sanitizeErrorMessage(error) });
  }
});

// ============================================================================
// 7. TRANSCRIBE AUDIO (gemini-3.5-transcribe)
// ============================================================================
app.post('/api/ai/transcribe', async (req, res) => {
  try {
    const { base64Audio, mimeType = 'audio/webm' } = req.body;
    if (!base64Audio) {
      return res.status(400).json({ error: 'El archivo o fragmento de audio es requerido.' });
    }

    const cleanBase64 = base64Audio.replace(/^data:[a-zA-Z0-9/]+;base64,/, '');

    const audioPart = {
      inlineData: {
        mimeType,
        data: cleanBase64,
      },
    };

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-transcribe',
      contents: {
        parts: [
          audioPart,
          { text: 'Transcribe este audio con exactitud en español, respetando puntuación y nombres bíblicos o eclesiales.' },
        ],
      },
    });

    res.json({
      transcription: response.text || '',
      model: 'gemini-3.5-transcribe',
    });
  } catch (error: any) {
    console.error('Error in /api/ai/transcribe:', error);
    res.status(500).json({ error: sanitizeErrorMessage(error) });
  }
});

// ============================================================================
// 8. REAL-TIME LIVE VOICE BRIDGE (gemini-3.8-live over WebSocket)
// ============================================================================
const wss = new WebSocketServer({ noServer: true });

wss.on('connection', async (clientWs: WebSocket) => {
  try {
    const session = await ai.live.connect({
      model: 'gemini-3.8-live',
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
        },
        systemInstruction: 'Eres el consejero de voz pastoral de A PRUEBA DE FUEGO. Habla con calidez, sabiduría bíblica y amabilidad cristiana.',
      },
      callbacks: {
        onmessage: (message: any) => {
          const audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
          if (audio && clientWs.readyState === WebSocket.OPEN) {
            clientWs.send(JSON.stringify({ audio }));
          }
          if (message.serverContent?.interrupted && clientWs.readyState === WebSocket.OPEN) {
            clientWs.send(JSON.stringify({ interrupted: true }));
          }
        },
      },
    });

    clientWs.on('message', (data: any) => {
      try {
        const parsed = JSON.parse(data.toString());
        if (parsed.audio) {
          session.sendRealtimeInput({
            audio: { data: parsed.audio, mimeType: 'audio/pcm;rate=16000' },
          });
        }
      } catch (err) {
        console.warn('Error parsing incoming live WS message:', err);
      }
    });

    clientWs.on('close', () => {
      session.close();
    });
  } catch (err) {
    console.error('Error connecting to Gemini Live session:', err);
    if (clientWs.readyState === WebSocket.OPEN) {
      clientWs.send(JSON.stringify({ error: 'No se pudo iniciar la sesión de voz en vivo.' }));
    }
  }
});

// Upgrade WebSocket for /live-ws
httpServer.on('upgrade', (request, socket, head) => {
  const { pathname } = new URL(request.url || '', `http://${request.headers.host}`);
  if (pathname === '/live-ws') {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  }
});

// ============================================================================
// VITE DEV MIDDLEWARES & STATIC SERVING
// ============================================================================
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (req, res) => {
      res.sendFile('dist/index.html', { root: '.' });
    });
  }

  const PORT = Number(process.env.PORT) || 3000;
  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`[A PRUEBA DE FUEGO] Servidor full-stack activo en el puerto ${PORT}`);
  });
}

startServer();
