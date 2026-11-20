"use client";
import { useAppSelector } from "@/redux/hooks";
import { useEffect } from "react";
import ProductsList from "@/components/productslist/ProductsList";
const Productpage = ({ initialProducts = null }) => {
  const language = useAppSelector((state) => state.Language.selectedLanguage);

  useEffect(() => {}, [language?.id]);
  return <ProductsList initialProducts={initialProducts} />;
};

export default Productpage;
