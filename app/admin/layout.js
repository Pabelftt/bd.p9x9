import AdminNav from "@/components/AdminNav";

export const metadata = {
  title: "Admin Portal",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({ children }) {
  return (
    <div className="admin-portal-wrapper">
      <AdminNav />
      <main className="admin-portal-content">{children}</main>
    </div>
  );
}
