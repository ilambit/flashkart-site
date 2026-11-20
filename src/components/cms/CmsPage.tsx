import BreadCrumb from "../breadcrumb/BreadCrumb";

// Server component: HTML arrives already sanitized (see utils/cmsContent).
const CmsPage = ({
  html,
  align = "start",
}: {
  html: string;
  align?: "start" | "center";
}) => (
  <section>
    <div>
      <BreadCrumb />
    </div>
    {html && (
      <div className="container my-5 bodyBackgroundColor px-1 md:px-0">
        <div
          className={`flex flex-col gap-4 rounded p-4 backgroundColor infoContent ${
            align === "center"
              ? "items-center"
              : "items-start [&_ul]:list-disc [&_ul]:pl-5 [&_a]:text-[revert] [&_a]:underline md:p-7"
          }`}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    )}
  </section>
);

export default CmsPage;
