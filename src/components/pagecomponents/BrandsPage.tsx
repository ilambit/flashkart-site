"use client";

import { useAppSelector } from "@/redux/hooks";
import { useEffect } from 'react'
import Brands from '../shop-by-brands/Brand'

const BrandsPage = () => {
    const language = useAppSelector((state) => state.Language.selectedLanguage)

    useEffect(() => { }, [language?.id])
    return (
        <Brands />
    )
}

export default BrandsPage
