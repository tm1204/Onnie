// Two translucent circles that add depth to gradient cards. The parent needs `relative overflow-hidden`.
export default function CardShine() {
  return (
    <>
      <span aria-hidden className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/20" />
      <span aria-hidden className="pointer-events-none absolute -bottom-8 -left-5 h-24 w-24 rounded-full bg-white/15" />
    </>
  );
}
