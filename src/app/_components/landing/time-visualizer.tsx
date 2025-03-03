export function TimeVisualizer() {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentDay = today.getDate();

  return (
    <div className="space-y-12">
      <h2 className="text-2xl font-medium">Time Passing</h2>
      <div className="grid grid-cols-12 gap-4">
        {months.map((month, monthIndex) => (
          <div key={month} className="space-y-4">
            <div className="text-xs font-medium text-neutral-400">{month}</div>
            <div className="space-y-1.5">
              {Array.from({ length: daysInMonth[monthIndex] ?? 0 }).map(
                (_, dayIndex) => {
                  const isPast =
                    monthIndex < currentMonth ||
                    (monthIndex === currentMonth && dayIndex + 1 <= currentDay);
                  return (
                    <div
                      key={`${month}-${dayIndex}`}
                      className={`h-1 rounded-full transition-colors ${
                        isPast ? "bg-neutral-900" : "bg-neutral-100"
                      }`}
                    />
                  );
                },
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
