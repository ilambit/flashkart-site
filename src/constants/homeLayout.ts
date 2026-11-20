// Shared between client (HomeLayout.tsx) and server (serverApi.ts) home_layout
// callers so the SSR-seeded first page and the client's initialData match check
// (which requires byte-identical section content) never drift.
export const HOME_LAYOUT_INITIAL_SECTION_LIMIT = 6;

// Same contract for page_builder (PageBuilderView + page/[slug] SSR seed).
export const PAGE_BUILDER_SECTION_LIMIT = 6;

/** Category Builder screen pages its sections the same way. */
export const CATEGORY_LAYOUT_SECTION_LIMIT = 6;
