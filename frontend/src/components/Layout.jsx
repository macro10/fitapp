export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-background pt-safe pb-safe">
      {children}
    </div>
  );
}