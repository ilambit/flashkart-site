import Skeleton from "react-loading-skeleton";
import CardSkeleton from "@/components/skeleton/CardSkeleton";

// Matches TransactionHistory shell + TransactionCard rows.
export default function Loading() {
  return (
    <div className="w-full cardBorder rounded-2xl overflow-hidden bg-white dark:bg-zinc-900 shadow-sm">
      <div className="flex items-center gap-3 p-4 md:p-5 border-b border-[color:var(--border-color)]">
        <Skeleton height={40} width={40} borderRadius={12} containerClassName="shrink-0 leading-none" />
        <Skeleton height={20} width={180} />
      </div>
      <div className="p-2 sm:p-3">
        <div className="grid grid-cols-12">
          {Array.from({ length: 6 }).map((_, index) => (
            <div className="col-span-12 lg:col-span-6" key={index}>
              <CardSkeleton variant="transaction" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
