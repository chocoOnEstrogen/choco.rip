const DB_NAME = 'contactFormDB';
const STORE_NAME = 'formSubmissions';
const DB_VERSION = 1;

export interface FormSubmission {
  requestId: string;
  sessionId: string;
  timestamp: string;
}

export async function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    console.log('Initializing IndexedDB...');
    
    if (!window.indexedDB) {
      const error = new Error('IndexedDB is not supported in this browser');
      console.error(error);
      reject(error);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error('IndexedDB error:', (event.target as IDBOpenDBRequest).error);
      reject((event.target as IDBOpenDBRequest).error);
    };

    request.onsuccess = () => {
      console.log('IndexedDB initialized successfully');
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      console.log('IndexedDB upgrade needed');
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        console.log('Creating object store:', STORE_NAME);
        db.createObjectStore(STORE_NAME, { keyPath: 'requestId' });
      }
    };
  });
}

export async function storeSubmission(submission: FormSubmission): Promise<void> {
  console.log('Attempting to store submission:', submission);
  
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(submission);

      request.onerror = (event) => {
        console.error('Error storing submission:', (event.target as IDBRequest).error);
        reject((event.target as IDBRequest).error);
      };

      request.onsuccess = () => {
        console.log('Submission stored successfully');
        resolve();
      };

      transaction.oncomplete = () => {
        console.log('Transaction completed');
      };

      transaction.onerror = (event) => {
        console.error('Transaction error:', (event.target as IDBTransaction).error);
        reject((event.target as IDBTransaction).error);
      };
    });
  } catch (error) {
    console.error('Failed to store submission:', error);
    throw error;
  }
}

export async function getSubmission(requestId: string): Promise<FormSubmission | undefined> {
  console.log('Attempting to get submission:', requestId);
  
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(requestId);

      request.onerror = (event) => {
        console.error('Error getting submission:', (event.target as IDBRequest).error);
        reject((event.target as IDBRequest).error);
      };

      request.onsuccess = () => {
        console.log('Submission retrieved:', request.result);
        resolve(request.result);
      };
    });
  } catch (error) {
    console.error('Failed to get submission:', error);
    throw error;
  }
} 