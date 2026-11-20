import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import {
  RiUpload2Line,
  RiFilePdf2Line,
  RiCloseFill,
  RiFileList3Line,
  RiCheckLine,
  RiCameraLine,
  RiImage2Line,
  RiInformationLine,
  RiArrowRightSLine,
} from "react-icons/ri";
import { t } from "@/utils/translation";
import { setPrescription, removePrescription } from "@/redux/slices/cartSlice";
import LightBox from "@/components/ui/LightBox";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import useHydratedMediaQuery from "@/hooks/useHydratedMediaQuery";

// Accept images + PDF only, capped at 5 MB.
const MAX_PRESCRIPTION_BYTES = 5 * 1024 * 1024;
const isValidType = (file: File) =>
  file?.type?.startsWith("image/") || file?.type === "application/pdf";

interface PrescriptionUploadProps {
  // product variant id (map key)
  variantId: string | number;
  // is_prescription_required (1 = required)
  isRequired: number | string | undefined;
  // tighter layout for the drawer surfaces
  compact?: boolean;
  // render as a single tight unit that drops into the qty-stepper row (badge
  // folded in)
  inline?: boolean;
}

// Per-item Rx upload (product_type 5); collects file only, enforcement lives at placement call sites.
const PrescriptionUpload = ({
  variantId,
  isRequired,
  compact = false,
  inline = false,
}: PrescriptionUploadProps) => {
  const dispatch = useAppDispatch();
  const inputRef = useRef<HTMLInputElement>(null);
  // Separate inputs so the OS opens the camera / gallery / files directly.
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const pdfRef = useRef<HTMLInputElement>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [sourceSheet, setSourceSheet] = useState(false);
  const isMobile = useHydratedMediaQuery("(max-width: 1023px)");
  const key = String(variantId);
  const stored = useAppSelector((s) => s.Cart.prescriptions?.[key]);
  // redux-persist rehydrates old persisted Files as plain {} — only treat real Blobs as valid.
  const file: File | null =
    typeof Blob !== "undefined" && stored instanceof Blob ? (stored as File) : null;
  const required = Number(isRequired) === 1;

  const isImage = file?.type?.startsWith("image/");
  // Object URL for the thumbnail/view action; recreated per file, revoked on cleanup.
  const previewUrl = useMemo(
    () => (file ? URL.createObjectURL(file) : null),
    [file],
  );
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  // Mobile asks for the source first, like the app; desktop opens the picker.
  const handlePick = () => {
    if (isMobile) {
      setSourceSheet(true);
      return;
    }
    inputRef.current?.click();
  };

  const pickFrom = (ref: React.RefObject<HTMLInputElement | null>) => {
    setSourceSheet(false);
    ref.current?.click();
  };

  // Images open in the lightbox; PDFs open in a new tab.
  const handleView = () => {
    if (!previewUrl) return;
    if (isImage) {
      setViewOpen(true);
    } else {
      window.open(previewUrl, "_blank", "noopener,noreferrer");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files?.[0];
    // reset input so re-picking the same filename fires change again
    e.target.value = "";
    if (!picked) return;
    if (!isValidType(picked)) {
      toast.error(t("invalid_prescription_type") || "Only image or PDF allowed");
      return;
    }
    if (picked.size > MAX_PRESCRIPTION_BYTES) {
      toast.error(t("prescription_too_large") || "File too large (max 5MB)");
      return;
    }
    dispatch(setPrescription({ variantId, file: picked }));
  };

  const handleRemove = () => dispatch(removePrescription({ variantId }));

  const sourceInputs = (
    <>
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleChange}
      />
      <input
        ref={galleryRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
      />
      <input
        ref={pdfRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={handleChange}
      />
    </>
  );

  const sourceOptions: Array<{
    key: string;
    label: string;
    icon: React.ReactNode;
    ref: React.RefObject<HTMLInputElement | null>;
  }> = [
    {
      key: "camera",
      label: t("take_photo") || "Take photo",
      icon: <RiCameraLine size={22} />,
      ref: cameraRef,
    },
    {
      key: "gallery",
      label: t("choose_from_gallery") || "Choose from Gallery",
      icon: <RiImage2Line size={22} />,
      ref: galleryRef,
    },
    {
      key: "pdf",
      label: t("choose_pdf") || "Choose PDF",
      icon: <RiFilePdf2Line size={22} />,
      ref: pdfRef,
    },
  ];

  const sourcePicker = (
    <Sheet open={sourceSheet} onOpenChange={setSourceSheet}>
      <SheetContent
        side="bottom"
        className="flex flex-col gap-0 rounded-t-3xl border-0 bodyBackgroundColor p-0 pb-6"
      >
        <div className="flex justify-center pt-2.5 pb-1">
          <span className="h-1 w-10 rounded-full bg-gray-300 dark:bg-zinc-700" />
        </div>
        <SheetTitle
          className="flex items-center gap-1.5 px-5 pb-1 pt-3 text-start text-lg font-bold textColor"
          title={t("prescription_hint") || "Image or PDF, up to 5MB"}
        >
          {t("upload_prescription") || "Upload Prescription"}
          <RiInformationLine size={16} className="SecondaryTextColor" />
        </SheetTitle>
        <div className="flex flex-col px-2 pt-2">
          {sourceOptions.map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={() => pickFrom(option.ref)}
              className="flex items-center gap-4 rounded-xl px-3 py-3.5 text-start active:primaryLightBack"
            >
              <span className="primaryColor shrink-0">{option.icon}</span>
              <span className="text-base textColor">{option.label}</span>
            </button>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );

  // Only images render a lightbox; PDFs handled in handleView.
  const lightbox =
    file && previewUrl && isImage ? (
      <LightBox
        showLightBox={viewOpen}
        setShowLightbox={setViewOpen}
        images={[{ src: previewUrl }]}
        imageIndex={0}
      />
    ) : null;

  // Inline: tight control for qty-stepper row. Uploaded → thumb + remove; empty → upload pill.
  if (inline) {
    return (
      <>
        <input
          ref={inputRef}
          type="file"
          accept="image/*,application/pdf"
          className="hidden"
          onChange={handleChange}
        />
        {file ? (
          // Uploaded — one-line text link: ✓ filename ✕
          <span className="order-last flex w-full basis-full items-center gap-1.5 text-xs">
            <RiCheckLine size={14} className="shrink-0 primaryColor" />
            <button
              type="button"
              onClick={handleView}
              title={t("view_prescription") || "View prescription"}
              className="min-w-0 max-w-[200px] truncate font-medium primaryColor hover:underline"
            >
              {file.name}
            </button>
            <button
              type="button"
              onClick={handleRemove}
              aria-label={t("remove_prescription") || "Remove"}
              className="shrink-0 text-gray-400 transition-colors hover:text-red-500"
            >
              <RiCloseFill size={15} />
            </button>
          </span>
        ) : (
          <button
            type="button"
            onClick={handlePick}
            title={
              required
                ? t("prescription_required") || "Prescription required"
                : t("prescription_optional") || "Prescription (optional)"
            }
            className={
              isMobile
                ? `inline-flex items-center gap-2 text-[13px] font-semibold ${
                    required ? "text-red-600 dark:text-red-400" : "textColor"
                  }`
                : `inline-flex h-8 items-center gap-1.5 rounded-lg border border-dashed px-2.5 text-[11px] font-bold transition-colors ${
                    required
                      ? "border-red-300 bg-red-50 text-red-600 hover:bg-red-100 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-400"
                      : "primaryColorBorder primaryColor hover:primaryLightBack"
                  }`
            }
          >
            {isMobile ? (
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border cardBorder">
                <RiUpload2Line size={13} />
              </span>
            ) : (
              <RiUpload2Line size={13} className="shrink-0" />
            )}
            {required
              ? t("upload_prescription_required") || "Upload Prescription"
              : t("upload_prescription") || "Upload Prescription"}
            {isMobile && (
              <RiArrowRightSLine
                size={16}
                className="SecondaryTextColor rtl:rotate-180"
              />
            )}
          </button>
        )}
        {sourceInputs}
        {sourcePicker}
        {lightbox}
      </>
    );
  }

  return (
    <div className={compact ? "mt-1.5" : "mt-2"}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*,application/pdf"
        className="hidden"
        onChange={handleChange}
      />

      {file ? (
        // Uploaded — preview chip: thumbnail/pdf icon + name + remove.
        <div className="flex items-center gap-2 rounded-lg border cardBorder bodyBackgroundColor p-1.5">
          <button
            type="button"
            onClick={handleView}
            title={t("view_prescription") || "View prescription"}
            className="flex min-w-0 flex-grow items-center gap-2 text-left"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-md primaryLightBack primaryColor">
              {isImage && previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previewUrl}
                  alt={file.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <RiFilePdf2Line size={18} />
              )}
            </span>
            <span className="min-w-0 flex-grow truncate text-xs font-medium textColor hover:underline">
              {file.name}
            </span>
          </button>
          <button
            type="button"
            onClick={handleRemove}
            aria-label={t("remove_prescription") || "Remove"}
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10"
          >
            <RiCloseFill size={15} />
          </button>
        </div>
      ) : (
        // Empty — badge (required/optional) + upload button.
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold ${
              required
                ? "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400"
                : "primaryLightBack primaryColor"
            }`}
          >
            <RiFileList3Line size={13} className="shrink-0" />
            {required
              ? t("prescription_required") || "Prescription required"
              : t("prescription_optional") || "Prescription (optional)"}
          </span>
          <button
            type="button"
            onClick={handlePick}
            className="inline-flex items-center gap-1.5 rounded-md border border-dashed primaryColorBorder px-2.5 py-1 text-[11px] font-bold primaryColor transition-colors hover:primaryLightBack"
          >
            <RiUpload2Line size={13} className="shrink-0" />
            {t("upload_prescription") || "Upload Prescription"}
          </button>
        </div>
      )}
      {sourceInputs}
      {sourcePicker}
      {lightbox}
    </div>
  );
};

export default PrescriptionUpload;
