import React from 'react'
import { initializeApp, FirebaseApp } from 'firebase/app'
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage'

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

export function useImage(id: number) {
    const firebase = useFirebase()
    const storage = React.useMemo(() => getStorage(firebase), [firebase])
    const fileName = React.useMemo(() => `marble-${id}.png`, [id])
    const storageRef = React.useMemo(() => {
        return id ? ref(storage, fileName) : null
    }, [storage, id])
    const [uploaded, setUploaded] = React.useState<boolean | undefined>()

    React.useEffect(() => {
        if (!storageRef) {
            return
        }

        setTimeout(() => {
            getDownloadURL(storageRef)
                .then(() => {
                    setUploaded(true)
                })
                .catch(() => setUploaded(false))
        })
    }, [storageRef, fileName, setUploaded])

    const download = React.useCallback(() => {
        if (!storageRef) {
            return
        }

        return getDownloadURL(storageRef)
    }, [fileName, storageRef])

    const upload = React.useCallback(
        (file: Blob) => {
            if (!storageRef) {
                return
            }

            return uploadBytes(storageRef, file)
                .then(() => setUploaded(true))
                .catch(() => setUploaded(false))
        },
        [fileName, setUploaded]
    )

    return { download, upload, uploaded }
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
