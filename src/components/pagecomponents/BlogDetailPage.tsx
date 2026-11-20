"use client";

import BlogDetail from "../blogs/BlogDetail";

const BlogDetailPage = ({ descriptionHtml }: { descriptionHtml: string }) => {
  return (
    <BlogDetail descriptionHtml={descriptionHtml} />
  );
};

export default BlogDetailPage;
