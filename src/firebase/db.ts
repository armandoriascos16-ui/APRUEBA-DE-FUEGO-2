import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  limit,
  WhereFilterOp
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './config';
import { 
  User, 
  Post, 
  Story,
  StoryComment,
  StoryReaction,
  StoryView,
  Challenge, 
  ChallengeSubmission, 
  EventItem,
  Comment
} from '../types';

// ============================================================================
// CONSTANTES DE COLECCIÓN
// ============================================================================
export const COLLECTIONS = {
  USERS: 'users',
  POSTS: 'posts',
  STORIES: 'stories',
  CHALLENGES: 'challenges',
  SUBMISSIONS: 'submissions',
  EVENTS: 'events',
} as const;

export type CollectionName = typeof COLLECTIONS[keyof typeof COLLECTIONS];

/**
 * Normaliza nombres de colección permitiendo tanto 'Users' como 'users'.
 */
export function normalizeCollection(name: string): string {
  const lower = name.toLowerCase().trim();
  switch (lower) {
    case 'users':
    case 'user':
      return COLLECTIONS.USERS;
    case 'posts':
    case 'post':
      return COLLECTIONS.POSTS;
    case 'stories':
    case 'story':
      return COLLECTIONS.STORIES;
    case 'challenges':
    case 'challenge':
      return COLLECTIONS.CHALLENGES;
    case 'submissions':
    case 'submission':
      return COLLECTIONS.SUBMISSIONS;
    case 'events':
    case 'event':
      return COLLECTIONS.EVENTS;
    default:
      return name;
  }
}

// ============================================================================
// FUNCIONES CRUD GENÉRICAS REUTILIZABLES
// ============================================================================

/**
 * Crea o actualiza un documento genérico en cualquier colección de Firestore.
 * @template T Objeto que contiene al menos un atributo 'id'
 * @param collectionName Nombre de la colección en Firestore (ej. 'users', 'Users')
 * @param data Objeto de datos a almacenar
 */
export async function createDocument<T extends { id: string }>(
  collectionName: string, 
  data: T
): Promise<void> {
  const col = normalizeCollection(collectionName);
  const path = `${col}/${data.id}`;
  try {
    await setDoc(doc(db, col, data.id), data, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Obtiene un documento genérico por su ID en la colección especificada.
 * @template T Tipo del documento esperado
 * @param collectionName Nombre de la colección en Firestore
 * @param id Identificador único del documento
 */
export async function getDocument<T>(
  collectionName: string, 
  id: string
): Promise<T | null> {
  const col = normalizeCollection(collectionName);
  const path = `${col}/${id}`;
  try {
    const snap = await getDoc(doc(db, col, id));
    return snap.exists() ? (snap.data() as T) : null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return null;
  }
}

/**
 * Obtiene todos los documentos de una colección con un límite opcional.
 * @template T Tipo de los documentos de la colección
 * @param collectionName Nombre de la colección
 * @param maxLimit Límite máximo de documentos a traer (por defecto 50)
 */
export async function getAllDocuments<T>(
  collectionName: string, 
  maxLimit: number = 50
): Promise<T[]> {
  const col = normalizeCollection(collectionName);
  try {
    const q = query(collection(db, col), limit(maxLimit));
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data() as T);
  } catch (error) {
    console.warn(`Error al consultar colección ${col}:`, error);
    return [];
  }
}

/**
 * Consulta documentos con una cláusula de filtrado simple (WHERE).
 * @template T Tipo de los documentos devueltos
 * @param collectionName Nombre de la colección
 * @param field Campo a filtrar
 * @param operator Operador de comparación de Firestore
 * @param value Valor con el que se compara
 * @param maxLimit Límite opcional de resultados
 */
export async function queryDocuments<T>(
  collectionName: string,
  field: string,
  operator: WhereFilterOp,
  value: unknown,
  maxLimit: number = 50
): Promise<T[]> {
  const col = normalizeCollection(collectionName);
  try {
    const q = query(
      collection(db, col),
      where(field, operator, value),
      limit(maxLimit)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data() as T);
  } catch (error) {
    console.warn(`Error en consulta de ${col} donde ${field} ${operator}:`, error);
    return [];
  }
}

/**
 * Actualiza campos específicos de un documento en la colección indicada.
 * @template T Tipo del documento a actualizar
 * @param collectionName Nombre de la colección
 * @param id Identificador del documento
 * @param updates Campos a actualizar de forma parcial
 */
export async function updateDocument<T>(
  collectionName: string, 
  id: string, 
  updates: Partial<T>
): Promise<void> {
  const col = normalizeCollection(collectionName);
  const path = `${col}/${id}`;
  try {
    await updateDoc(doc(db, col, id), updates as any);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

/**
 * Elimina un documento de la colección especificada.
 * @param collectionName Nombre de la colección
 * @param id Identificador del documento a borrar
 */
export async function deleteDocument(
  collectionName: string, 
  id: string
): Promise<void> {
  const col = normalizeCollection(collectionName);
  const path = `${col}/${id}`;
  try {
    await deleteDoc(doc(db, col, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Suscripción en tiempo real a una colección genérica.
 * @template T Tipo de los documentos de la colección
 * @param collectionName Nombre de la colección
 * @param onUpdate Callback ejecutado con los documentos actualizados
 * @param maxLimit Límite máximo de documentos en escucha
 * @returns Función para cancelar la suscripción
 */
export function subscribeToCollection<T>(
  collectionName: string,
  onUpdate: (docs: T[]) => void,
  maxLimit: number = 50
): () => void {
  const col = normalizeCollection(collectionName);
  const q = query(collection(db, col), limit(maxLimit));
  return onSnapshot(
    q,
    (snapshot) => {
      const items = snapshot.docs.map(d => d.data() as T);
      onUpdate(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, col);
    }
  );
}

// ============================================================================
// INTERFAZ Y FABRICADOR DE CRUD GENÉRICO
// ============================================================================
export interface GenericCrud<T extends { id: string }> {
  create: (data: T) => Promise<void>;
  get: (id: string) => Promise<T | null>;
  getAll: (maxLimit?: number) => Promise<T[]>;
  update: (id: string, updates: Partial<T>) => Promise<void>;
  delete: (id: string) => Promise<void>;
  subscribe?: (callback: (docs: T[]) => void, maxLimit?: number) => () => void;
}

/**
 * Fábrica para instanciar un manejador CRUD genérico para cualquier entidad.
 */
export function createCollectionCrud<T extends { id: string }>(collectionName: string): GenericCrud<T> {
  const col = normalizeCollection(collectionName);
  return {
    create: (data: T) => createDocument<T>(col, data),
    get: (id: string) => getDocument<T>(col, id),
    getAll: (maxLimit?: number) => getAllDocuments<T>(col, maxLimit),
    update: (id: string, updates: Partial<T>) => updateDocument<T>(col, id, updates),
    delete: (id: string) => deleteDocument(col, id),
    subscribe: (callback: (docs: T[]) => void, maxLimit?: number) => subscribeToCollection<T>(col, callback, maxLimit),
  };
}

// ============================================================================
// 1. MANEJADOR CRUD: 'USERS' (users)
// ============================================================================

export const usersCrud = createCollectionCrud<User>(COLLECTIONS.USERS);

export async function createUser(user: User): Promise<void> {
  return usersCrud.create(user);
}

export async function getUser(userId: string): Promise<User | null> {
  return usersCrud.get(userId);
}

export async function getAllUsers(maxLimit?: number): Promise<User[]> {
  return usersCrud.getAll(maxLimit);
}

export async function updateUser(userId: string, updates: Partial<User>): Promise<void> {
  return usersCrud.update(userId, updates);
}

export async function deleteUser(userId: string): Promise<void> {
  return usersCrud.delete(userId);
}

export const usersDb = {
  ...usersCrud,
  createUser,
  getUser,
  getAllUsers,
  updateUser,
  deleteUser,
  subscribe: (callback: (users: User[]) => void) => subscribeToCollection<User>(COLLECTIONS.USERS, callback)
};

// ============================================================================
// 2. MANEJADOR CRUD: 'POSTS' (posts)
// ============================================================================

export const postsCrud = createCollectionCrud<Post>(COLLECTIONS.POSTS);

export async function createPost(post: Post): Promise<void> {
  return postsCrud.create(post);
}

export async function getPost(postId: string): Promise<Post | null> {
  return postsCrud.get(postId);
}

export async function getAllPosts(maxLimit?: number): Promise<Post[]> {
  return postsCrud.getAll(maxLimit);
}

export async function getPostsByAuthor(authorId: string, maxLimit?: number): Promise<Post[]> {
  return queryDocuments<Post>(COLLECTIONS.POSTS, 'authorId', '==', authorId, maxLimit);
}

export async function updatePost(postId: string, updates: Partial<Post>): Promise<void> {
  return postsCrud.update(postId, updates);
}

export async function deletePost(postId: string): Promise<void> {
  return postsCrud.delete(postId);
}

export function subscribePosts(onUpdate: (posts: Post[]) => void, maxLimit?: number): () => void {
  return subscribeToCollection<Post>(COLLECTIONS.POSTS, onUpdate, maxLimit);
}

// ============================================================================
// SUBCOLECCIÓN 'COMMENTS' DENTRO DE CADA DOCUMENTO DE 'POSTS' EN FIRESTORE
// Ruta: /posts/{postId}/comments/{commentId}
// ============================================================================

/**
 * Guarda un comentario en la subcolección 'comments' dentro del documento de la publicación en Firestore.
 * @param postId ID del documento de la publicación en la colección 'posts'
 * @param comment Objeto con los datos del comentario (autor, contenido, sticker, fecha, etc.)
 */
/**
 * Guarda un comentario o respuesta anidada en Firestore.
 * Sube tanto a la subcolección 'comments' como a la subcolección 'replies' del comentario padre si aplica.
 * @param postId ID del documento de la publicación en la colección 'posts'
 * @param comment Objeto con los datos del comentario (autor, contenido, sticker, parentId, etc.)
 */
export async function addPostComment(postId: string, comment: Comment): Promise<void> {
  const path = `posts/${postId}/comments/${comment.id}`;
  try {
    // 1. Guardar en /posts/{postId}/comments/{comment.id}
    await setDoc(doc(db, 'posts', postId, 'comments', comment.id), comment);

    // 2. Si es una respuesta anidada (tiene parentId), registrar también en /posts/{postId}/comments/{parentId}/replies/{comment.id}
    if (comment.parentId) {
      await setDoc(doc(db, 'posts', postId, 'comments', comment.parentId, 'replies', comment.id), comment);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Convierte un arreglo plano de comentarios en un árbol jerárquico de comentarios y respuestas.
 * @param flatComments Lista plana de comentarios
 */
export function buildCommentsTree(flatComments: Comment[]): Comment[] {
  const commentMap = new Map<string, Comment>();
  const rootComments: Comment[] = [];

  // Paso 1: Clonar e inicializar mapa con array de replies
  flatComments.forEach(c => {
    commentMap.set(c.id, { ...c, replies: [] });
  });

  // Paso 2: Conectar hijos a sus padres
  flatComments.forEach(c => {
    const item = commentMap.get(c.id)!;
    if (c.parentId && commentMap.has(c.parentId)) {
      const parent = commentMap.get(c.parentId)!;
      if (!parent.replies) parent.replies = [];
      parent.replies.push(item);
      parent.repliesCount = (parent.repliesCount || 0) + 1;
    } else {
      rootComments.push(item);
    }
  });

  return rootComments;
}

/**
 * Alterna el 'like' (Me gusta / Amén) en un comentario o respuesta en Firestore.
 */
export async function toggleCommentLike(
  postId: string, 
  commentId: string, 
  userId: string, 
  parentId?: string | null
): Promise<void> {
  const path = `posts/${postId}/comments/${commentId}`;
  try {
    const commentRef = doc(db, 'posts', postId, 'comments', commentId);
    const snap = await getDoc(commentRef);
    if (snap.exists()) {
      const data = snap.data() as Comment;
      const likedUserIds = data.likedUserIds || [];
      const hasLiked = likedUserIds.includes(userId);
      const newLikedIds = hasLiked ? likedUserIds.filter(id => id !== userId) : [...likedUserIds, userId];
      const newLikes = hasLiked ? Math.max(0, (data.likes || 1) - 1) : (data.likes || 0) + 1;

      await updateDoc(commentRef, {
        likes: newLikes,
        likedUserIds: newLikedIds,
      });

      if (parentId) {
        const replyRef = doc(db, 'posts', postId, 'comments', parentId, 'replies', commentId);
        await updateDoc(replyRef, {
          likes: newLikes,
          likedUserIds: newLikedIds,
        }).catch(() => {});
      }
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Obtiene todos los comentarios de la subcolección 'comments' de una publicación específica.
 * @param postId ID del documento en 'posts'
 */
export async function getPostComments(postId: string): Promise<Comment[]> {
  const path = `posts/${postId}/comments`;
  try {
    const snap = await getDocs(collection(db, 'posts', postId, 'comments'));
    return snap.docs.map(d => d.data() as Comment);
  } catch (error) {
    console.warn(`Error al consultar subcolección de comentarios en ${path}:`, error);
    return [];
  }
}

/**
 * Escucha en tiempo real los comentarios de una publicación desde su subcolección 'comments'.
 * @param postId ID del documento en 'posts'
 * @param onUpdate Callback con la lista actualizada de comentarios
 */
export function subscribePostComments(
  postId: string, 
  onUpdate: (comments: Comment[]) => void
): () => void {
  const path = `posts/${postId}/comments`;
  return onSnapshot(
    collection(db, 'posts', postId, 'comments'),
    (snapshot) => {
      const items = snapshot.docs.map(d => d.data() as Comment);
      onUpdate(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

/**
 * Elimina un comentario de la subcolección 'comments' de una publicación.
 * @param postId ID de la publicación
 * @param commentId ID del comentario
 */
export async function deletePostComment(postId: string, commentId: string): Promise<void> {
  const path = `posts/${postId}/comments/${commentId}`;
  try {
    await deleteDoc(doc(db, 'posts', postId, 'comments', commentId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export const postsDb = {
  ...postsCrud,
  createPost,
  getPost,
  getAllPosts,
  getPostsByAuthor,
  updatePost,
  deletePost,
  subscribe: subscribePosts,
  comments: {
    add: addPostComment,
    getAll: getPostComments,
    subscribe: subscribePostComments,
    delete: deletePostComment,
    buildTree: buildCommentsTree,
    toggleLike: toggleCommentLike,
  }
};

// ============================================================================
// 3. MANEJADOR CRUD: 'CHALLENGES' (challenges)
// ============================================================================

export const challengesCrud = createCollectionCrud<Challenge>(COLLECTIONS.CHALLENGES);

export async function createChallenge(challenge: Challenge): Promise<void> {
  return challengesCrud.create(challenge);
}

export async function getChallenge(challengeId: string): Promise<Challenge | null> {
  return challengesCrud.get(challengeId);
}

export async function getAllChallenges(maxLimit?: number): Promise<Challenge[]> {
  return challengesCrud.getAll(maxLimit);
}

export async function getChallengesByCategory(category: string): Promise<Challenge[]> {
  return queryDocuments<Challenge>(COLLECTIONS.CHALLENGES, 'category', '==', category);
}

export async function updateChallenge(challengeId: string, updates: Partial<Challenge>): Promise<void> {
  return challengesCrud.update(challengeId, updates);
}

export async function deleteChallenge(challengeId: string): Promise<void> {
  return challengesCrud.delete(challengeId);
}

// Submissions de Retos
export async function createSubmission(sub: ChallengeSubmission): Promise<void> {
  return createDocument<ChallengeSubmission>(COLLECTIONS.SUBMISSIONS, sub);
}

export async function getSubmission(subId: string): Promise<ChallengeSubmission | null> {
  return getDocument<ChallengeSubmission>(COLLECTIONS.SUBMISSIONS, subId);
}

export async function getAllSubmissions(): Promise<ChallengeSubmission[]> {
  return getAllDocuments<ChallengeSubmission>(COLLECTIONS.SUBMISSIONS);
}

export async function updateSubmission(subId: string, updates: Partial<ChallengeSubmission>): Promise<void> {
  return updateDocument<ChallengeSubmission>(COLLECTIONS.SUBMISSIONS, subId, updates);
}

export async function deleteSubmission(subId: string): Promise<void> {
  return deleteDocument(COLLECTIONS.SUBMISSIONS, subId);
}

export const challengesDb = {
  ...challengesCrud,
  createChallenge,
  getChallenge,
  getAllChallenges,
  getByCategory: getChallengesByCategory,
  updateChallenge,
  deleteChallenge,
  submissions: {
    create: createSubmission,
    get: getSubmission,
    getAll: getAllSubmissions,
    update: updateSubmission,
    delete: deleteSubmission
  }
};

// ============================================================================
// 4. MANEJADOR CRUD: 'EVENTS' (events)
// ============================================================================

export const eventsCrud = createCollectionCrud<EventItem>(COLLECTIONS.EVENTS);

export async function createEvent(event: EventItem): Promise<void> {
  return eventsCrud.create(event);
}

export async function getEvent(eventId: string): Promise<EventItem | null> {
  return eventsCrud.get(eventId);
}

export async function getAllEvents(maxLimit?: number): Promise<EventItem[]> {
  return eventsCrud.getAll(maxLimit);
}

export async function getEventsByCity(city: string): Promise<EventItem[]> {
  return queryDocuments<EventItem>(COLLECTIONS.EVENTS, 'city', '==', city);
}

export async function updateEvent(eventId: string, updates: Partial<EventItem>): Promise<void> {
  return eventsCrud.update(eventId, updates);
}

export async function deleteEvent(eventId: string): Promise<void> {
  return eventsCrud.delete(eventId);
}

export const eventsDb = {
  ...eventsCrud,
  createEvent,
  getEvent,
  getAllEvents,
  getByCity: getEventsByCity,
  updateEvent,
  deleteEvent,
  subscribe: (callback: (events: EventItem[]) => void) => subscribeToCollection<EventItem>(COLLECTIONS.EVENTS, callback)
};

// ============================================================================
// 5. MANEJADOR CRUD: 'STORIES' (stories)
// ============================================================================

export const storiesCrud = createCollectionCrud<Story>(COLLECTIONS.STORIES);

export async function createStoryInDb(story: Story): Promise<void> {
  return storiesCrud.create(story);
}

export async function getStoryFromDb(storyId: string): Promise<Story | null> {
  return storiesCrud.get(storyId);
}

export async function getAllStoriesFromDb(maxLimit?: number): Promise<Story[]> {
  return storiesCrud.getAll(maxLimit);
}

export async function deleteStoryFromDb(storyId: string): Promise<void> {
  return storiesCrud.delete(storyId);
}

export function subscribeStories(onUpdate: (stories: Story[]) => void, maxLimit?: number): () => void {
  return subscribeToCollection<Story>(COLLECTIONS.STORIES, onUpdate, maxLimit);
}

export const storiesDb = {
  ...storiesCrud,
  createStory: createStoryInDb,
  getStory: getStoryFromDb,
  getAllStories: getAllStoriesFromDb,
  deleteStory: deleteStoryFromDb,
  subscribe: subscribeStories,
};

