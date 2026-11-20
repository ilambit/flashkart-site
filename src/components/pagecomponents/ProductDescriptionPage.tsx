"use client";

import { useAppSelector } from "@/redux/hooks";
import { useEffect } from 'react'
import ProductDescription from '../productdetail/ProductDetail'

const ProductDescriptionPage = ({ initialProduct, initialProductMeta }: any) => {
    const language = useAppSelector((state) => state.Language.selectedLanguage)

    useEffect(() => { }, [language?.id])
    return (
        <ProductDescription
            initialProduct={initialProduct}
            initialProductMeta={initialProductMeta}
        />
    )
}

export default ProductDescriptionPage