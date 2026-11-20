"use client";

import { useAppSelector } from "@/redux/hooks";
import { useEffect } from 'react'
import FAQs from '../faqs/FAQs'

const FAQsPage = () => {
    const language = useAppSelector((state) => state.Language.selectedLanguage)

    useEffect(() => { }, [language?.id])
    return (
        <FAQs />
    )
}

export default FAQsPage
