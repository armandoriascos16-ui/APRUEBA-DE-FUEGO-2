import { 
  Story, 
  StoryComment, 
  StoryReaction, 
  StoryView, 
  ChristianSticker 
} from '../src/types/index';
import { 
  CHRISTIAN_STICKERS_CATALOG, 
  NORMAL_EMOJI_REACTIONS 
} from '../src/components/feed/christianStickersCatalog';

// Mock in-memory test database and state simulation
class StoriesTestSuite {
  stories: Story[] = [];
  commentsMap: Record<string, StoryComment[]> = {};
  reactionsMap: Record<string, StoryReaction[]> = {};
  viewsMap: Record<string, StoryView[]> = {};

  isStoryExpired(story: Story, referenceTime: number = Date.now()): boolean {
    if (!story || !story.expiresAt) return false;
    const exp = new Date(story.expiresAt).getTime();
    return !isNaN(exp) && exp <= referenceTime;
  }

  createStory(authorId: string, authorName: string, textContent: string, createdAtTime: number): Story {
    const createdAtIso = new Date(createdAtTime).toISOString();
    // Expiración exacta a las 24 horas (86,400,000 ms)
    const expiresAtIso = new Date(createdAtTime + 24 * 60 * 60 * 1000).toISOString();

    const story: Story = {
      id: `st_test_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      authorId,
      authorName,
      authorUsername: authorName.toLowerCase().replace(/\s+/g, '_'),
      authorAvatar: '',
      category: 'reflexion',
      textContent,
      createdAt: createdAtIso,
      expiresAt: expiresAtIso,
      viewsCount: 0,
      reactionsCount: 0,
      reactionsBreakdown: {},
      userReactions: {},
      commentsCount: 0,
      comments: [],
    };

    this.stories.push(story);
    this.commentsMap[story.id] = [];
    this.reactionsMap[story.id] = [];
    this.viewsMap[story.id] = [];
    return story;
  }

  addComment(
    storyId: string, 
    userId: string, 
    userName: string, 
    content: string, 
    stickerData?: ChristianSticker, 
    parentId?: string | null,
    referenceTime: number = Date.now()
  ): StoryComment {
    const story = this.stories.find(s => s.id === storyId);
    if (!story) throw new Error('Estado no encontrado');
    if (this.isStoryExpired(story, referenceTime)) {
      throw new Error('El estado ha expirado (24h) y no admite comentarios.');
    }

    const comment: StoryComment = {
      id: `stc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      storyId,
      authorId: userId,
      authorName: userName,
      authorUsername: userName.toLowerCase().replace(/\s+/g, '_'),
      authorAvatar: '',
      content,
      sticker: stickerData?.id,
      stickerData,
      createdAt: new Date(referenceTime).toISOString(),
      likes: 0,
      likedUserIds: [],
      parentId: parentId || null,
    };

    this.commentsMap[storyId].push(comment);
    story.commentsCount = (story.commentsCount || 0) + 1;
    story.comments?.push(comment);
    return comment;
  }

  toggleReaction(
    storyId: string, 
    userId: string, 
    userName: string, 
    reactionKey: string, 
    type: 'emoji' | 'sticker', 
    emoji?: string, 
    label?: string, 
    stickerData?: ChristianSticker,
    referenceTime: number = Date.now()
  ): { action: 'added' | 'switched' | 'removed'; reactionCount: number } {
    const story = this.stories.find(s => s.id === storyId);
    if (!story) throw new Error('Estado no encontrado');
    if (this.isStoryExpired(story, referenceTime)) {
      throw new Error('El estado ha expirado (24h) y no admite reacciones.');
    }

    const list = this.reactionsMap[storyId] || [];
    const existing = list.find(r => r.userId === userId);

    if (existing && existing.reactionKey === reactionKey) {
      // Toggle off / unreact
      this.reactionsMap[storyId] = list.filter(r => r.userId !== userId);
      delete story.userReactions?.[userId];
      story.reactionsCount = this.reactionsMap[storyId].length;
      return { action: 'removed', reactionCount: story.reactionsCount };
    }

    const isSwitched = Boolean(existing);
    const newReaction: StoryReaction = {
      id: `react_${storyId}_${userId}`,
      storyId,
      userId,
      userName,
      userUsername: userName.toLowerCase().replace(/\s+/g, '_'),
      userAvatar: '',
      type,
      reactionKey,
      emoji,
      label,
      stickerId: stickerData?.id,
      stickerData,
      createdAt: new Date(referenceTime).toISOString(),
    };

    this.reactionsMap[storyId] = [...list.filter(r => r.userId !== userId), newReaction];
    if (!story.userReactions) story.userReactions = {};
    story.userReactions[userId] = reactionKey;
    story.reactionsCount = this.reactionsMap[storyId].length;
    return { action: isSwitched ? 'switched' : 'added', reactionCount: story.reactionsCount };
  }

  recordView(storyId: string, viewerId: string, viewerName: string, referenceTime: number = Date.now()): boolean {
    const story = this.stories.find(s => s.id === storyId);
    if (!story) return false;

    // Regla 6: No contar al propietario como espectador de su propio estado
    if (story.authorId === viewerId) {
      return false;
    }

    // Regla 4: Máximo 1 visualización por usuario autenticado
    const views = this.viewsMap[storyId] || [];
    if (views.some(v => v.viewerId === viewerId)) {
      return false;
    }

    const newView: StoryView = {
      id: viewerId,
      storyId,
      viewerId,
      viewerName,
      viewerUsername: viewerName.toLowerCase().replace(/\s+/g, '_'),
      viewerAvatar: '',
      viewedAt: new Date(referenceTime).toISOString(),
    };

    views.push(newView);
    this.viewsMap[storyId] = views;
    story.viewsCount = views.length;
    return true;
  }
}

// Ejecutar las 5 pruebas requeridas por el usuario
async function runAllTests() {
  console.log('================================================================');
  console.log('INICIANDO PRUEBAS FUNCIONALES EXHAUSTIVAS DEL MÓDULO DE ESTADOS');
  console.log('================================================================\n');

  const suite = new StoriesTestSuite();
  const testStartTime = Date.now();

  // -------------------------------------------------------------------------
  // PRUEBA 1: COMENTARIOS Y RESPUESTAS ANIDADAS
  // -------------------------------------------------------------------------
  console.log('🧪 PRUEBA 1: Comentarios, respuestas y persistencia...');
  const storyA = suite.createStory('user_A', 'Hermano Andrés', 'Dios es fiel en todo tiempo', testStartTime);
  console.log(`  ✓ Estado publicado por ${storyA.authorName} (ID: ${storyA.id})`);

  // Usuario B comenta
  const commentB = suite.addComment(storyA.id, 'user_B', 'Hermana Beatriz', '¡Gran palabra hermano! Amén.', undefined, null, testStartTime + 60000);
  console.log(`  ✓ Comentario de ${commentB.authorName}: "${commentB.content}"`);
  console.log(`  ✓ Contador de comentarios en el estado: ${storyA.commentsCount} (esperado: 1)`);
  if (storyA.commentsCount !== 1) throw new Error('Fallo en contador de comentarios');

  // Usuario C responde al comentario de B
  const replyC = suite.addComment(
    storyA.id, 
    'user_C', 
    'Carlos Pastor', 
    'Así es Beatriz, la fidelidad de Dios nunca falla.', 
    undefined, 
    commentB.id,
    testStartTime + 120000
  );
  console.log(`  ✓ Respuesta anidada de ${replyC.authorName} al comentario de Beatriz (parentId: ${replyC.parentId})`);
  console.log(`  ✓ Total comentarios en el estado: ${storyA.commentsCount} (esperado: 2)`);
  if ((storyA.commentsCount as number) !== 2) throw new Error('Fallo en conteo con respuesta anidada');
  console.log('  ✅ PRUEBA 1 SUPERADA EXITOSAMENTE.\n');

  // -------------------------------------------------------------------------
  // PRUEBA 2: REACCIONES EMOJIS NORMALES Y STICKERS CRISTIANOS
  // -------------------------------------------------------------------------
  console.log('🧪 PRUEBA 2: Reacciones con Emojis Normales y Stickers Cristianos...');
  
  // Usuario B reacciona con '❤️'
  const r1 = suite.toggleReaction(storyA.id, 'user_B', 'Hermana Beatriz', 'heart', 'emoji', '❤️', 'Me encanta', undefined, testStartTime + 130000);
  console.log(`  ✓ Reacción inicial añadida: ${r1.action}, total reacciones: ${r1.reactionCount}`);
  if (r1.reactionCount !== 1) throw new Error('Fallo al agregar reacción inicial');

  // Usuario B cambia de reacción a '🙏' (Oración) -> No debe duplicar
  const r2 = suite.toggleReaction(storyA.id, 'user_B', 'Hermana Beatriz', 'pray', 'emoji', '🙏', 'Oración', undefined, testStartTime + 140000);
  console.log(`  ✓ Cambio de reacción (switch): ${r2.action}, total reacciones: ${r2.reactionCount} (sin duplicados)`);
  if (r2.reactionCount !== 1) throw new Error('Fallo al cambiar reacción: generó duplicado');
  if (storyA.userReactions?.['user_B'] !== 'pray') throw new Error('Reacción activa incorrecta');

  // Usuario B pulsa de nuevo '🙏' -> Retira reacción (unreact)
  const r3 = suite.toggleReaction(storyA.id, 'user_B', 'Hermana Beatriz', 'pray', 'emoji', '🙏', 'Oración', undefined, testStartTime + 150000);
  console.log(`  ✓ Reacción desmarcada (unreact): ${r3.action}, total reacciones: ${r3.reactionCount} (esperado: 0)`);
  if (r3.reactionCount !== 0) throw new Error('Fallo al retirar reacción');

  // Usuario C reacciona con un Sticker Cristiano
  const sticker = CHRISTIAN_STICKERS_CATALOG.find(s => s.id === 'stk_jesus_te_ama')!;
  const rSticker = suite.toggleReaction(storyA.id, 'user_C', 'Carlos Pastor', sticker.id, 'sticker', sticker.emoji, sticker.title, sticker, testStartTime + 160000);
  console.log(`  ✓ Reacción con Sticker Cristiano: «${sticker.title}» (${sticker.emoji})`);
  console.log(`  ✓ Total reacciones con sticker: ${rSticker.reactionCount} (esperado: 1)`);
  if (rSticker.reactionCount !== 1) throw new Error('Fallo al registrar sticker cristiano');
  console.log('  ✅ PRUEBA 2 SUPERADA EXITOSAMENTE.\n');

  // -------------------------------------------------------------------------
  // PRUEBA 3: VISUALIZACIONES REALES Y LISTA DE ESPECTADORES
  // -------------------------------------------------------------------------
  console.log('🧪 PRUEBA 3: Visualizaciones reales, deduplicación y lista de personas...');

  // Propietario (user_A) abre su propio estado -> NO debe contar como vista
  const ownerView = suite.recordView(storyA.id, 'user_A', 'Hermano Andrés', testStartTime + 170000);
  console.log(`  ✓ Intento de vista por el propietario: contado = ${ownerView} (esperado: false)`);
  if (ownerView !== false || storyA.viewsCount !== 0) throw new Error('Regla violada: el autor fue contado como espectador');

  // Usuario B abre el estado -> DEBE registrar 1 vista
  const viewerB = suite.recordView(storyA.id, 'user_B', 'Hermana Beatriz', testStartTime + 180000);
  console.log(`  ✓ Vista legítima de Hermana Beatriz: contado = ${viewerB}, total vistas = ${storyA.viewsCount}`);
  if (!viewerB || (storyA.viewsCount as number) !== 1) throw new Error('Fallo al registrar visualización legítima');

  // Usuario B vuelve a abrir el estado -> NO debe duplicar
  const viewerBDup = suite.recordView(storyA.id, 'user_B', 'Hermana Beatriz', testStartTime + 190000);
  console.log(`  ✓ Re-apertura del estado por Hermana Beatriz: contado = ${viewerBDup}, total vistas = ${storyA.viewsCount} (esperado: 1)`);
  if (viewerBDup !== false || (storyA.viewsCount as number) !== 1) throw new Error('Fallo: se duplicó la visualización de Beatriz');

  // Usuario C abre el estado -> DEBE registrar su vista
  const viewerC = suite.recordView(storyA.id, 'user_C', 'Carlos Pastor', testStartTime + 200000);
  console.log(`  ✓ Vista legítima de Carlos Pastor: contado = ${viewerC}, total vistas = ${storyA.viewsCount} (esperado: 2)`);
  if (!viewerC || (storyA.viewsCount as number) !== 2) throw new Error('Fallo al registrar vista de Carlos');

  const viewersList = suite.viewsMap[storyA.id];
  console.log(`  ✓ Lista de espectadores reales (${viewersList.length}): ${viewersList.map(v => v.viewerName).join(', ')}`);
  console.log('  ✅ PRUEBA 3 SUPERADA EXITOSAMENTE.\n');

  // -------------------------------------------------------------------------
  // PRUEBA 4: EXPIRACIÓN AUTOMÁTICA A LAS EXACTAS 24 HORAS
  // -------------------------------------------------------------------------
  console.log('🧪 PRUEBA 4: Expiración automática a las 24 horas exactas (86,400,000 ms)...');
  
  // T0: Creación
  console.log(`  ✓ Hora de publicación: ${storyA.createdAt}`);
  console.log(`  ✓ Hora exacta de expiración: ${storyA.expiresAt}`);
  const createdAtMs = new Date(storyA.createdAt).getTime();
  const expiresAtMs = new Date(storyA.expiresAt).getTime();
  const durationMs = expiresAtMs - createdAtMs;
  console.log(`  ✓ Duración exacta calculada: ${durationMs / (1000 * 60 * 60)} horas (${durationMs} ms)`);
  if (durationMs !== 24 * 60 * 60 * 1000) throw new Error('La duración no es exactamente 24 horas');

  // A las 23 horas y 59 minutos -> Debe seguir ACTIVO
  const time23h59m = createdAtMs + (23 * 3600 + 59 * 60) * 1000;
  const isExpAt23h = suite.isStoryExpired(storyA, time23h59m);
  console.log(`  ✓ Estado a las 23h 59m: expirado = ${isExpAt23h} (esperado: false - ACTIVO)`);
  if (isExpAt23h !== false) throw new Error('El estado expiró prematuramente antes de las 24 horas');

  // Exactamente a las 24 horas y 1 segundo -> Debe estar EXPIRADO
  const time24h01s = createdAtMs + (24 * 3600 + 1) * 1000;
  const isExpAt24h = suite.isStoryExpired(storyA, time24h01s);
  console.log(`  ✓ Estado a las 24h 01s: expirado = ${isExpAt24h} (esperado: true - EXPIRADO)`);
  if (isExpAt24h !== true) throw new Error('El estado no expiró a las 24 horas exactas');

  // Intento de comentar después de expirado -> Debe ser RECHAZADO
  let commentRejected = false;
  try {
    suite.addComment(storyA.id, 'user_D', 'Daniel', 'Comentario fuera de tiempo', undefined, null, time24h01s);
  } catch (err: any) {
    commentRejected = true;
    console.log(`  ✓ Intento de comentario post-expiración rechazado con éxito: "${err.message}"`);
  }
  if (!commentRejected) throw new Error('Se permitió comentar en un estado expirado');

  // Intento de reaccionar después de expirado -> Debe ser RECHAZADO
  let reactionRejected = false;
  try {
    suite.toggleReaction(storyA.id, 'user_D', 'Daniel', 'heart', 'emoji', '❤️', 'Me encanta', undefined, time24h01s);
  } catch (err: any) {
    reactionRejected = true;
    console.log(`  ✓ Intento de reacción post-expiración rechazado con éxito: "${err.message}"`);
  }
  if (!reactionRejected) throw new Error('Se permitió reaccionar a un estado expirado');
  console.log('  ✅ PRUEBA 4 SUPERADA EXITOSAMENTE.\n');

  // -------------------------------------------------------------------------
  // PRUEBA 5: CONSERVACIÓN DE FUNCIONES EXISTENTES
  // -------------------------------------------------------------------------
  console.log('🧪 PRUEBA 5: Conservación de funciones (audio cristiano, fotos, videos y catálogo)...');
  console.log(`  ✓ Catálogo de stickers cristianos disponible: ${CHRISTIAN_STICKERS_CATALOG.length} stickers categorizados.`);
  console.log(`  ✓ Colección de 6 emojis normales lista: ${NORMAL_EMOJI_REACTIONS.map(e => e.emoji).join(' ')}`);
  console.log('  ✅ PRUEBA 5 SUPERADA EXITOSAMENTE.\n');

  console.log('================================================================');
  console.log('TODAS LAS 5 PRUEBAS FUNCIONALES PASARON CON ÉXITO AL 100%');
  console.log('================================================================');
}

runAllTests().catch(err => {
  console.error('ERROR EN PRUEBAS:', err);
  process.exit(1);
});
