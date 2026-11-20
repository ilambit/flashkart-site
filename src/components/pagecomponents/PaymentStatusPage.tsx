"use client";

import { useAppSelector } from "@/redux/hooks";
import { useEffect } from 'react'
import PaymentStatus from '../payment-status/PaymentStatus'

const PaymentStatusPage = () => {
    const language = useAppSelector((state) => state.Language.selectedLanguage)

    useEffect(() => { }, [language?.id])
    return (
        <PaymentStatus />
    )
}

export default PaymentStatusPage