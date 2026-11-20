"use client";
import api from "../axiosMiddleware";
import * as apiEndPoints from "../apiEndpoints";

export const getBlogsCategories = async ({
  offset = 0,
  limit = 10,
  search = "",
}: any): Promise<any> => {
  const params = {
    limit,
    offset,
    ...(search != "" ? { search } : {}),
  };

  const response = await api.get(apiEndPoints.blogCategories, { params });
  return response.data;
};


export const getBlogs = async ({
  offset,
  limit,
  slug,
  categoryId = null,
  tag_id = null,
}: any): Promise<any> => {
  const params = {
    limit,
    offset,
    slug,
    ...(categoryId !== null ? { category_id: categoryId } : null),
    ...(tag_id !== null ? { tag_id: tag_id } : null),
  };
  const response = await api.get(apiEndPoints.blogs, { params });
  return response.data;
};


export const setBlogCount = async ({ blogId }: any): Promise<any> => {
  const formData = new FormData();
  formData.append("blog_id", blogId);
  const response = await api.post(apiEndPoints.blogViewCount, formData);
  return response.data;
};


export const getMostViewedBlogs = async ({ limit = 5 }: any): Promise<any> => {
  const response = await api.get(
    `${apiEndPoints.blogs}/${apiEndPoints.mostViewedBlogs}`
  );
  return response.data;
};


export const getTags = async (): Promise<any> => {
  const response = await api.get(`${apiEndPoints.blogTags}`);
  return response.data;
};
