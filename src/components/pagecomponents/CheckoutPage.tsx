"use client";

import { useAppSelector } from "@/redux/hooks";
import { useEffect } from 'react'
import Checkout from '../checkoutpage/CheckoutUI'
import AuthGate from '@/components/auth/AuthGate'

const CheckoutPageInner = () => {
    const language = useAppSelector((state) => state.Language.selectedLanguage)

    useEffect(() => { }, [language?.id])
    return (
        <Checkout />
    )
}

const CheckoutPage = () => (
    <AuthGate requireAuth>
        <CheckoutPageInner />
    </AuthGate>
);

export default CheckoutPage