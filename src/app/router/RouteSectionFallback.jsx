export default function RouteSectionFallback() {
  return (
    <section className="flex min-h-[calc(100vh-124px)] flex-col gap-4">
      <div className="h-8 w-40 animate-pulse rounded bg-[#e8ded4]" />
      <div className="h-16 animate-pulse rounded-[18px] bg-[#efe5dc]" />
      <div className="grid grid-cols-3 gap-4 max-[1120px]:grid-cols-2 max-[720px]:grid-cols-1">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={`route-fallback-${index}`}
            className="min-h-[220px] animate-pulse rounded-[18px] bg-[#f3ece5]"
          />
        ))}
      </div>
    </section>
  );
}
