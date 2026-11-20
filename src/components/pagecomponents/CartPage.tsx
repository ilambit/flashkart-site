"use client";

import { useAppSelector } from "@/redux/hooks";
import { useEffect } from 'react'
import Cart from '../cart/Cart'

const CartPage = () => {
    const language = useAppSelector((state) => state.Language.selectedLanguage)

    useEffect(() => { }, [language?.id])
    return (
        <Cart />
    )
}

export default CartPage