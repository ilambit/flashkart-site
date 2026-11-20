"use client";
import api from "../axiosMiddleware";
import * as apiEndPoints from "../apiEndpoints";

export const getProductRatings = async ({ id, limit, offset }: any): Promise<any> => {
  const params = {
    product_id: id,
    limit: limit,
    offset: offset,
  };
  const response = await api.get(
    `${apiEndPoints.getProducts}/${apiEndPoints.getProductRatings}`,
    { params }
  );

  return response.data;
};


export const getProductImages = async ({ id, limit, offset }: any): Promise<any> => {
  const response = await api.get(
    `${apiEndPoints.getProducts}/${apiEndPoints.rating}/${apiEndPoints.imageList}`,
    { params: { product_id: id, limit, offset } }
  );
  return response.data;
};


export const reviewProduct = async ({ productId, rating, review, images }: any): Promise<any> => {
  const formData = new FormData();
  formData.append("product_id", productId);
  formData.append("rate", rating);
  formData.append("review", review);
  for (let i = 0; i < images?.length; i++) {
    formData.append(`image[${i}]`, images[i]);
  }
  const response = await api.post(
    `${apiEndPoints.getProducts}/${apiEndPoints.rating}/${apiEndPoints.add}`,
    formData
  );
  return response.data;
};


export const getProductRating = async ({ ratingId }: any): Promise<any> => {
  const formData = new FormData();
  formData.append("id", ratingId);
  const response = await api.post(
    `${apiEndPoints.getProducts}/${apiEndPoints.rating}/${apiEndPoints.edit}`,
    formData
  );
  return response.data;
};


export const updateReviewProduct = async ({
  ratingId,
  rating,
  review,
  deleteImages,
  images,
}: any): Promise<any> => {
  const formData = new FormData();
  formData.append("id", ratingId);
  formData.append("rate", rating);
  formData.append("review", review);
  formData.append("deleteImageIds", `[${deleteImages}]`);
  for (let i = 0; i < images?.length; i++) {
    formData.append(`image[${i}]`, images[i]);
  }
  const response = await api.post(
    `${apiEndPoints.getProducts}/${apiEndPoints.rating}/${apiEndPoints.update}`,
    formData
  );
  return response.data;
};
