"use client"
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React from 'react'


const GoBackBtn = () => {
    const router = useRouter()
    return (
        <button
            onClick={() => router.back()}
            className="p-3 rounded-xl hover:bg-secondary transition-colors border border-border cursor-pointer"
            aria-label="Go back"
        >
            <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
    )
}

export default GoBackBtn