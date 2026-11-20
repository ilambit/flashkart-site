"use client";
import React, { useState, useEffect } from "react";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import BlogCard from "./BlogCard";
import BlogsCategories from "./BlogsCategories";
import RecentBlogs from "./RecentBlogs";
import * as api from "@/api/apiRoutes";
import BlogSkeleton, { BlogCardSkeleton } from "./BlogsSkeleton";
import { t } from "@/utils/translation";
import BreadCrumb from "../breadcrumb/BreadCrumb";
import PopularBlogTags from "./PopularBlogTags";
import ThemedSvg from "@/components/notfound/ThemedSvg";
import NoBlogImage from "@/assets/empty-state/no-blog.svg";

const BLOG_LIMIT = 10;
const FIVE_MIN = 1000 * 60 * 5;

const Blogs = () => {
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [selectedTag, setSelectedTag] = useState<any>(null);
  const topRef = React.useRef<HTMLDivElement>(null);

  // Sidebar data is filter-independent, so cache it across visits.
  const categoriesQuery = useQuery({
    queryKey: ["blogs-categories"],
    queryFn: () => api.getBlogsCategories({}).then((res: any) => res?.data || []),
    staleTime: FIVE_MIN,
  });
  const mostViewedQuery = useQuery({
    queryKey: ["blogs-most-viewed"],
    queryFn: () => api.getMostViewedBlogs({ limit: 5 }).then((res: any) => res?.data || []),
    staleTime: FIVE_MIN,
  });
  const tagsQuery = useQuery({
    queryKey: ["blogs-tags"],
    queryFn: () => api.getTags().then((res: any) => res?.data || []),
    staleTime: FIVE_MIN,
  });
  const blogsQuery = useInfiniteQuery({
    queryKey: ["blogs-list", selectedCategory, selectedTag],
    queryFn: ({ pageParam }) =>
      api.getBlogs({
        offset: pageParam,
        limit: BLOG_LIMIT,
        categoryId: selectedCategory,
        tag_id: selectedTag,
      }),
    initialPageParam: 0,
    getNextPageParam: (_last: any, pages: any[]) => pages.length * BLOG_LIMIT,
    staleTime: FIVE_MIN,
  });

  const blogsCategories: any[] = categoriesQuery.data ?? [];
  const mostViewedBlogs: any[] = mostViewedQuery.data ?? [];
  const tags: any[] = tagsQuery.data ?? [];
  const blogs: any[] = blogsQuery.data?.pages.flatMap((p: any) => p?.data ?? []) ?? [];
  const totalBlogs: number | null = blogsQuery.data?.pages[0]?.total ?? null;

  // One loading flag for the sidebar queries — avoids stacked skeletons.
  const loading =
    categoriesQuery.isPending || mostViewedQuery.isPending || tagsQuery.isPending;
  const blogsLoading = blogsQuery.isPending;
  const blogsError = blogsQuery.isError;

  const handleFetchBlogs = () => {
    blogsQuery.refetch();
  };

  useEffect(() => {
    if (!blogsLoading && topRef.current) {
      topRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [blogsLoading]);

  const blogAvailable =
    blogsCategories?.length > 0 ||
    mostViewedBlogs?.length > 0 ||
    tags?.length > 0;

  const isFiltering = selectedCategory !== null || selectedTag !== null;

  return loading ? (
    <BlogSkeleton />
  ) : (
    <>
      <div ref={topRef}></div>
      <BreadCrumb />
      <div className="container my-12">
        <div className="grid lg:grid-cols-12 gap-6 grid-cols-1">
          <div
            className={`${isFiltering || blogs?.length > 0 ? "lg:col-span-8" : "lg:col-span-12"} md:col-span-12 col-span-12 flex flex-col gap-6`}
          >
            {!blogsLoading && blogsError && (
              <div className="w-full flex flex-col justify-center items-center gap-3 min-h-[420px] text-center bodyBackgroundColor border rounded-2xl p-10">
                <h2 className="text-xl font-bold textColor mt-1">
                  {t("something_went_wrong") || "Something went wrong"}
                </h2>
                <button
                  type="button"
                  onClick={handleFetchBlogs}
                  className="mt-3 primaryBackColor text-white text-sm font-semibold px-6 py-2.5 rounded-lg"
                >
                  {t("retry") || t("try_again") || "Retry"}
                </button>
              </div>
            )}
            {!blogsLoading && !blogsError && blogs?.length === 0 && (
              <div className="w-full flex flex-col justify-center items-center gap-3 min-h-[420px] text-center bodyBackgroundColor border rounded-2xl p-10">
                <ThemedSvg
                  src={NoBlogImage}
                  alt={t("noBlogFound")}
                  className="w-3/4 max-w-[220px]"
                />
                <h2 className="text-xl font-bold textColor mt-1">
                  {t("noBlogFound")}
                </h2>
                <p className="subTextColor text-sm max-w-sm">
                  {isFiltering
                    ? t("tryDifferentCategory")
                    : t("checkBackLater")}
                </p>
                {isFiltering && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCategory(null);
                      setSelectedTag(null);
                    }}
                    className="mt-3 primaryBackColor text-white text-sm font-semibold px-6 py-2.5 rounded-lg"
                  >
                    {t("viewAllBlogs")}
                  </button>
                )}
              </div>
            )}
            {(blogsLoading || blogs?.length > 0) && (
              <div className="grid lg:grid-cols-2 grid-cols-1 md:grid-cols-2 gap-6">
                {blogsLoading
                  ? Array.from({ length: 4 }).map((_, i) => (
                      <BlogCardSkeleton key={`blog-skeleton-${i}`} />
                    ))
                  : blogs?.map((blog) => (
                      <BlogCard key={blog?.id ?? blog?.slug} blog={blog} />
                    ))}
              </div>
            )}
            {(blogs?.length ?? 0) < (totalBlogs ?? 0) && (
              <div className="w-full flex justify-center mt-6">
                <button
                  type="button"
                  className="bg-[#29363f] rounded-md text-white text-base font-medium gap-1 p-1.5 px-3"
                  onClick={() => blogsQuery.fetchNextPage()}
                >
                  {t("load_more")}
                </button>
              </div>
            )}
          </div>

          {blogAvailable && (isFiltering || blogs?.length > 0) && (
            <div className="lg:col-span-4 md:col-span-12 col-span-12 flex flex-col gap-6">
              {blogsCategories?.length > 0 && (
                <BlogsCategories
                  blogsCategories={blogsCategories}
                  selectedCategory={selectedCategory}
                  setSelectedCategory={setSelectedCategory}
                />
              )}
              {mostViewedBlogs?.length > 0 && (
                <RecentBlogs mostViewedBlogs={mostViewedBlogs} />
              )}
              {tags?.length > 0 && (
                <PopularBlogTags
                  tags={tags}
                  setSelectedTag={setSelectedTag}
                  selectedTag={selectedTag}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Blogs;
