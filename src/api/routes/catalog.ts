"use client";
import api from "../axiosMiddleware";
import * as apiEndPoints from "../apiEndpoints";

export const getShop = async ({ latitude, longitude }: any): Promise<any> => {
  let params = { latitude: latitude, longitude: longitude };
  const response = await api.get(apiEndPoints.getShop, { params });
  return response.data;
};

export const getSellers = async ({ limit, offset, latitude, longitude }: any = {}): Promise<any> => {
  const params = {
    limit,
    offset,
    latitude,
    longitude,
  };
  const response = await api.get(apiEndPoints.getSellers, { params });
  return response.data;
};


export const getHomeLayout = async ({
  latitude,
  longitude,
  category_id = null,
  limit,
  offset,
  device,
}: any): Promise<any> => {
  const params: Record<string, any> = {
    latitude,
    longitude,
  };
  if (category_id != null && category_id !== "") {
    params.category_id = category_id;
  }
  if (limit != null) {
    params.limit = limit;
  }
  if (offset != null) {
    params.offset = offset;
  }
  if (device != null && device !== "") {
    params.device = device;
  }
  const response = await api.get(apiEndPoints.homeLayout, { params });
  return response.data;
};


export const getCategoryLayout = async ({
  latitude,
  longitude,
  limit,
  offset,
  device,
}: any): Promise<any> => {
  const params: Record<string, any> = { latitude, longitude };
  if (limit != null) params.limit = limit;
  if (offset != null) params.offset = offset;
  if (device != null && device !== "") params.device = device;
  const response = await api.get(apiEndPoints.categoryLayout, { params });
  return response.data;
};


export const getPageBuilder = async ({
  slug,
  id,
  latitude,
  longitude,
  limit,
  offset,
}: any): Promise<any> => {
  const params: Record<string, any> = { latitude, longitude };
  if (slug != null && slug !== "") params.slug = slug;
  else if (id != null && id !== "") params.id = id;
  if (limit != null) params.limit = limit;
  if (offset != null) params.offset = offset;
  const response = await api.get(apiEndPoints.pageBuilder, { params });
  return response.data;
};


export const getCategories = async ({
  slug = "",
  id = "",
  limit,
  offset,
  is_own_data,
  latitude,
  longitude,
}: any = {}): Promise<any> => {
  const params = {
    limit,
    offset,
    ...(slug && { slug }),
    ...(id && { id }),
    ...(is_own_data && { is_own_data }),
    ...(latitude != null && { latitude }),
    ...(longitude != null && { longitude }),
  };

  const response = await api.get(apiEndPoints.getCategory, { params });
  return response.data;
};


export const getProductByFilter = async ({
  latitude,
  longitude,
  filters = undefined,
  tag_names = "",
  slug = "",
  is_similar_product_id = "",
}: any): Promise<any> => {
  // GET since the API moved these reads off POST — POST now answers 405.
  const params: Record<string, any> = { latitude, longitude };
  if (tag_names !== "") params.tag_names = tag_names;
  if (slug !== "") params.tag_slug = slug;
  if (is_similar_product_id !== "" && is_similar_product_id != null) {
    params.is_similar_product_id = is_similar_product_id;
  }
  if (filters !== undefined) {
    for (const filter in filters) {
      if (
        (filters[filter] !== null &&
          filters[filter] !== undefined &&
          filters[filter] !== "") ||
        filters[filter]?.length > 0
      ) {
        params[filter] = filters[filter];
      }
    }
  }
  const response = await api.get(apiEndPoints.getProducts, { params });
  return response.data;
};


export const getProductFilters = async ({
  latitude,
  longitude,
  category_id,
  data_source,
  manual_product_ids,
  source_id,
  block_category_ids,
  block_brand_ids,
  filter_mode,
  min_discount_percent,
  max_discount_percent,
  attribute_value_ids,
  min_price,
  max_price,
}: any): Promise<any> => {
  const params: Record<string, any> = {};
  if (latitude != null) params.latitude = latitude;
  if (longitude != null) params.longitude = longitude;
  if (category_id != null && category_id !== "") {
    params.category_id = category_id;
  }
  if (data_source != null && data_source !== "") {
    params.data_source = data_source;
    if (
      data_source === "manual" &&
      manual_product_ids != null &&
      manual_product_ids !== ""
    ) {
      params.manual_product_ids = manual_product_ids;
    } else if (source_id != null && source_id !== "") {
      if (data_source === "category") {
        params.category_id = source_id;
      } else if (data_source === "brand") {
        params.brand_ids = source_id;
      }
    }
  }
  // An automatic row can also be scoped by category or brand — ids pass through as received.
  if (!params.category_id && block_category_ids) {
    params.category_id = block_category_ids;
  }
  if (!params.brand_ids && block_brand_ids) {
    params.brand_ids = block_brand_ids;
  }
  if (filter_mode != null && filter_mode !== "") {
    params.filter_mode = filter_mode;
  }
  if (min_discount_percent != null && min_discount_percent !== "") {
    params.min_discount_percent = min_discount_percent;
  }
  if (max_discount_percent != null && max_discount_percent !== "") {
    params.max_discount_percent = max_discount_percent;
  }
  // Slider "Product list with filters" scope — same set the list was built from.
  if (attribute_value_ids != null && attribute_value_ids !== "") {
    params.attribute_value_ids = attribute_value_ids;
  }
  if (min_price != null && min_price !== "") params.min_price = min_price;
  if (max_price != null && max_price !== "") params.max_price = max_price;
  const response = await api.get(apiEndPoints.getProductFilters, { params });
  return response.data;
};


export const getBrands = async ({ limit, offset, latitude, longitude }: any): Promise<any> => {
  let params = {
    limit: limit,
    offset: offset,
    latitude: latitude,
    longitude: longitude,
  };
  const response = await api.get(apiEndPoints.getBrands, { params });
  return response.data;
};


export const getProductById = async ({ latitude, longitude, slug, id }: any): Promise<any> => {
  const params: Record<string, any> = { latitude, longitude };
  if (id !== -1) params.id = id;
  if (slug) params.slug = slug;
  const response = await api.get(apiEndPoints.getProductById, { params });
  return response.data;
};


export const addRecentlyViewedProduct = async ({ productId, latitude, longitude }: any): Promise<any> => {
  const formData = new FormData();
  formData.append("product_id", productId);
  if (latitude != null) formData.append("latitude", latitude);
  if (longitude != null) formData.append("longitude", longitude);
  const response = await api.post(
    `${apiEndPoints.getProducts}/${apiEndPoints.addRecentlyViewedProduct}`,
    formData
  );
  return response.data;
};


export const getRecentlyViewedProducts = async ({ productId, latitude, longitude }: any): Promise<any> => {
  const params = {
    product_id: productId,
    ...(latitude != null && { latitude }),
    ...(longitude != null && { longitude }),
  };
  const response = await api.get(
    `${apiEndPoints.getProducts}/${apiEndPoints.recentlyVisited}`,
    { params }
  );
  return response.data;
};
