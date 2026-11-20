"use client";

import { useAppSelector } from "@/redux/hooks";
import { useEffect } from 'react'
import CategoryLayoutView from '../categories/CategoryLayoutView'
import Category from '../categories/Category'

const CategoriesPages = ({
    initialCategory = null,
    subCategoryPage = false,
}: {
    initialCategory?: any
    // /categories/[slug] lists that category's children, not the builder layout
    subCategoryPage?: boolean
}) => {
    const language = useAppSelector((state) => state.Language.selectedLanguage)

    useEffect(() => {

    }, [language?.id])
    if (subCategoryPage) return <Category initialCategory={initialCategory} />
    return (
        <CategoryLayoutView initialCategory={initialCategory} />
    )
}

export default CategoriesPages