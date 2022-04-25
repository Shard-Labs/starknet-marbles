import type { AppProps } from 'next/app'
import NextHead from 'next/head'
import { InjectedConnector, StarknetProvider } from '@starknet-react/core'
import { FirebaseProvider } from '~/providers/FirebaseProvider'

function MyApp({ Component, pageProps }: AppProps) {
    const connectors = [new InjectedConnector()]

    return (
        <FirebaseProvider>
            <NextHead>
                <title>StarkNet ❤️ Marbles</title>
            </NextHead>
            <Component {...pageProps} />
        </FirebaseProvider>
    )
}

export default MyApp
