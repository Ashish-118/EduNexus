"use client"; // ✅ Add this
import { useEffect } from "react";
import * as React from "react"
import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp"
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from "@/components/ui/input-otp"
import { cn } from "@/lib/utils";
import { useUser, useClerk } from "@clerk/nextjs";


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
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"


function SelectRole({ Role, setRole }: { Role: string; setRole: (val: string) => void }) {
    return (
        <Select value={Role} onValueChange={setRole}>
            <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                    <SelectLabel>Role</SelectLabel>
                    <SelectItem value="Student">Student</SelectItem>
                    <SelectItem value="Educator">Educator</SelectItem>
                </SelectGroup>
            </SelectContent>
        </Select>
    )
}



function InputOTPPattern({ code, setCode }: { code: string; setCode: (val: string) => void }) {
    return (
        <InputOTP
            maxLength={6}
            pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
            value={code}
            onChange={(val) => setCode(val)}
        >
            <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
            </InputOTPGroup>
        </InputOTP>
    )
}
export default function Page() {


    const { isLoaded, signUp, setActive } = useSignUp()
    const [emailAddress, setEmailAddress] = useState('')
    const [password, setPassword] = useState('')
    const [pendingVerification, setPendingVerification] = useState(false)
    const [code, setCode] = useState('')

    const [clerkId, setClerkId] = useState('')
    const [error, setError] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [step, setStep] = useState(1);
    const [sessionId, setSessionId] = useState<string | null>(null)
    const [firstName, setFirstName] = useState('')
    const [username, setUsername] = useState('')
    const [country, setCountry] = useState('')
    const [lastName, setLastName] = useState('')
    const [role, setRole] = useState({

        Role: "",

    });

    const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
    const router = useRouter()

    useEffect(() => {
        const storedData = localStorage.getItem("part1data");
        if (storedData) {
            try {
                const d = JSON.parse(storedData);
                if (d.step) setStep(d.step);
            } catch (error) {
                console.error("Invalid localStorage data", error);
            }
        }
    }, []);



    if (!isLoaded) {
        return null;
    }

    async function submit(e: React.FormEvent) {
        e.preventDefault()
        if (!isLoaded) {
            return;
        }

        try {
            const user = await signUp.create({
                emailAddress,
                password,
            })
            await signUp.prepareEmailAddressVerification({
                strategy: "email_code"
            })
            if (user?.id) {
                setClerkId(user.id)
            }
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
            console.log(completePart1)
            if (completePart1.status !== "complete") {
                console.log(JSON.stringify(completePart1, null, 2))

            }

            if (completePart1.status === "complete") {

                setSessionId(completePart1?.createdSessionId)
                const part1DATA = {
                    step: 2,
                    emailAddress: emailAddress,
                    password: password,
                    sessionId: completePart1?.createdSessionId,
                    signUpCompleted: false,
                    clerkId: clerkId
                }


                localStorage.setItem("part1data", JSON.stringify(part1DATA))
                console.log("visited here at complete ")
                setStep(2)
                document.cookie = "signupComplete=false; path=/";


            }


        } catch (error: any) {
            console.log(JSON.stringify(error, null, 2))
            setError(error.errors[0].message)
        }
    }

    async function onSignUp(e: React.FormEvent) {
        e.preventDefault();
        const part1data = JSON.parse(localStorage.getItem("part1data") || "{}");
        // console.log(part1data)
        console.log(username, firstName, lastName, role.Role)
        const R = role.Role;
        const email = part1data.emailAddress;
        const clerkId = part1data.clerkId;
        const response = await fetch(`${BASE_URL}/api/store_user`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userName: username, firstName, lastName, role: R, email, clerkId }),
        });
        console.log(response);
        if (response.status === 200) {

            if (setActive) {
                await setActive({ session: part1data.sessionId });
                document.cookie = "signupComplete=true; path=/";

                localStorage.clear();
            }
        }
    }


    const handleRoleChange = (val: string) => {
        setRole((prev) => ({
            ...prev,
            Role: val, // Updates only the Role field
        }));
    };





    const BottomGradient = () => {
        return (
            <>
                <span className="group-hover/btn:opacity-100 block transition duration-500 opacity-0 absolute h-px w-full -bottom-px inset-x-0 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
                <span className="group-hover/btn:opacity-100 blur-sm block transition duration-500 opacity-0 absolute h-px w-1/2 mx-auto -bottom-px inset-x-10 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
            </>
        );
    };




    return (
        <Card className="w-[350px]">

            {
                (step == 1) &&
                <>
                    <CardHeader>
                        <CardTitle>Sign Up</CardTitle>
                        <CardDescription>Welcome to the Ai world.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit}>
                            <div className="grid w-full items-center gap-4">
                                <div className="flex flex-col space-y-1.5">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" placeholder="Enter your email" value={emailAddress} onChange={(e) => setEmailAddress(e.target.value)} />
                                </div>
                                <div className="flex flex-col space-y-1.5">
                                    <Label htmlFor="password">Password </Label>
                                    <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
                                </div>
                                {
                                    pendingVerification &&
                                    <div className="flex flex-col space-y-1.5">
                                        <Label htmlFor="password">Enter CODE</Label>
                                        <InputOTPPattern code={code} setCode={setCode} />
                                    </div>
                                }

                            </div>

                            <CardFooter className="flex justify-between mt-4">
                                {
                                    pendingVerification ?
                                        (
                                            <Button type="submit" onClick={onPressVerify}> Verify</Button>
                                        )
                                        :
                                        (
                                            <Button onClick={submit}> Get code</Button>
                                        )
                                }


                            </CardFooter>
                        </form>
                    </CardContent>
                </>
            }

            {/* this is the second part  */}

            {
                (step == 2) &&
                <div className="max-w-md w-full mx-auto rounded-none md:rounded-2xl p-4 md:p-8 shadow-input bg-white dark:bg-black">
                    <h2 className="font-bold text-xl text-neutral-800 dark:text-neutral-200">
                        Welcome to EduNexus
                    </h2>
                    <p className="text-neutral-600 text-sm max-w-sm mt-2 dark:text-neutral-300">
                        complete the signUp to Embark a new Journey with AI
                    </p>

                    <form className="my-8" onSubmit={onSignUp}>
                        <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 mb-4">
                            <div>
                                <Label htmlFor="firstname">First name</Label>
                                <Input name="firstName" value={firstName} onChange={(e) => {

                                    setFirstName(e.target.value)
                                }
                                } />
                            </div>
                            <div>
                                <Label htmlFor="lastname">Last name</Label>
                                <Input name="lastName" value={lastName} onChange={(e) =>

                                    setLastName(e.target.value)
                                } />
                            </div>
                        </div>
                        <div className="mb-4">
                            <Label htmlFor="username">Username</Label>
                            <Input id="username" value={username} onChange={(e) =>
                                setUsername(e.target.value)
                            } />
                        </div>


                        <div className="mb-4">
                            <SelectRole Role={role.Role} setRole={handleRoleChange} />
                        </div>


                        <button
                            className="bg-gradient-to-br relative group/btn from-black dark:from-zinc-900 dark:to-zinc-900 to-neutral-600 block dark:bg-zinc-800 w-full text-white rounded-md h-10 font-medium shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset]"
                            type="submit"

                        >
                            Sign up &rarr;
                            <BottomGradient />
                        </button>

                        <div className="bg-gradient-to-r from-transparent via-neutral-300 dark:via-neutral-700 to-transparent my-8 h-[1px] w-full" />


                    </form>
                </div>

            }

        </Card>
    )
}


