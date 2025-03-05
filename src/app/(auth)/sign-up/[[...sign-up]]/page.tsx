import { SignUp } from '@clerk/nextjs'
import { useSignUp } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'


export default function Page() {
    const { isLoaded, signUp, setActive } = useSignUp()
    const [emailAddress, setemailAddress] = useState('')
    const [password, setPassword] = useState('')
    const [pendingVerification, setPendingVerification] = useState(false)
    const [code, setCode] = useState('')
    const [error, setError] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const router = useRouter()

    if (!isLoaded) {
        return null;
    }

    async function submit(e: React.FormEvent) {
        e.preventDefault()
        if (!isLoaded) {
            return;
        }

        try {
            await signUp.create({
                emailAddress,
                password,
            })
            await signUp.prepareEmailAddressVerification({
                strategy: "email_code"
            })
            setPendingVerification(true)
        }
        catch (error: any) {
            console.log(JSON.stringify(error))
            setError(error.errors[0].message)
        }
    }

    async function onPressVerify(e: React.FormEvent) {
        e.preventDefault()
        if (!isLoaded) {
            return;
        }

        try {
            const completePart1 = await signUp.attemptEmailAddressVerification({ code })

            if (completePart1.status !== "complete") {
                console.log(JSON.stringify(completePart1, null, 2))
            }
            if (completePart1.status === "complete") {
                await setActive({ session: completePart1.createdSessionId })
                router.push('/home')
            }
        } catch (error: any) {
            console.log(JSON.stringify(error, null, 2))
            setError(error.errors[0].message)

        }

    }


    // return <SignUp />
}