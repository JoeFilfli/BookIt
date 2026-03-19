export function BusinessCardSkeleton() {
  return (
    <div className="rounded-xl overflow-hidden bg-white shadow-sm animate-pulse">
      <div className="h-44 bg-gray-200" />
      <div className="p-4 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
        <div className="flex justify-between mt-3">
          <div className="h-3 bg-gray-200 rounded w-16" />
          <div className="h-3 bg-gray-200 rounded w-12" />
        </div>
      </div>
    </div>
  );
}

export function BookingCardSkeleton() {
  return (
    <div className="rounded-xl bg-white p-5 shadow-sm animate-pulse">
      <div className="flex justify-between gap-4">
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-1/2" />
          <div className="h-3 bg-gray-200 rounded w-3/4" />
          <div className="h-3 bg-gray-200 rounded w-2/3" />
        </div>
        <div className="w-16 space-y-2">
          <div className="h-4 bg-gray-200 rounded" />
          <div className="h-3 bg-gray-200 rounded w-8 ml-auto" />
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <div className="h-7 bg-gray-200 rounded-lg w-24" />
        <div className="h-7 bg-gray-200 rounded-lg w-24" />
      </div>
    </div>
  );
}

export function BusinessProfileSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 animate-pulse">
      <div className="h-72 bg-gray-200" />
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 space-y-6">
            <div className="space-y-2">
              <div className="h-8 bg-gray-200 rounded w-1/2" />
              <div className="h-4 bg-gray-200 rounded w-1/3" />
              <div className="h-4 bg-gray-200 rounded w-full mt-2" />
              <div className="h-4 bg-gray-200 rounded w-5/6" />
            </div>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-gray-200 rounded-lg" />
              ))}
            </div>
          </div>
          <div className="w-full lg:w-96 shrink-0">
            <div className="h-64 bg-gray-200 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function SlotsSkeleton() {
  return (
    <div className="grid grid-cols-3 gap-1.5 animate-pulse">
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={i} className="h-8 bg-gray-200 rounded-lg" />
      ))}
    </div>
  );
}
