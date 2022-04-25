import React from 'react'
import { initializeApp, FirebaseApp } from 'firebase/app'
import { getStorage, ref, uploadBytes } from 'firebase/storage'

const FirebaseContext = React.createContext<FirebaseApp | null>(null)

export function useFirebase() {
    const firebase = React.useContext(FirebaseContext)

    if (!firebase) {
        throw new Error('useFirebase must be used within a FirebaseProvider')
    }

    return firebase
}

export function useUpload() {
    const firebase = useFirebase()
    const storage = getStorage(firebase)

    return (name: string, file: Blob) => {
        const storageRef = ref(storage, name)
        return uploadBytes(storageRef, file)
    }
}

export const FirebaseProvider: React.FC = ({ children }) => {
    const firebaseConfig = {
        apiKey: 'AIzaSyBaY_oacXcj1FPQrlwYTOIvbex3g26kJYM',
        authDomain: 'marbles-ef6a2.firebaseapp.com',
        projectId: 'marbles-ef6a2',
        storageBucket: 'marbles-ef6a2.appspot.com',
        messagingSenderId: '789335917886',
        appId: '1:789335917886:web:7d0c8b3e9667a71570186f',
    }
    const app = initializeApp(firebaseConfig)

    return (
        <FirebaseContext.Provider value={app}>
            {children}
        </FirebaseContext.Provider>
    )
}
