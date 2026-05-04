interface StatusIndicatorProps {
  active: boolean;
  size?: "sm" | "md" | "lg";
}

export default function StatusIndicator({
  active,
  size = "md",
}: StatusIndicatorProps) {
  const sizeClass = {
    sm: "w-2 h-2",
    md: "w-3 h-3",
    lg: "w-4 h-4",
  }[size];

  return (
    <span
      className={`inline-block rounded-full ${sizeClass} ${
        active ? "bg-green-500 animate-pulse" : "bg-gray-400"
      }`}
    />
  );
}
