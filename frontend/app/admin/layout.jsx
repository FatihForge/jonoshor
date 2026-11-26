import AdminAuthGuard from '../components/AdminAuthGuard';

export const metadata = {
  title: 'Admin Portal',
  description: 'Staff console for complaint intake triage, evidence verification, and case management.',
};

export default function AdminLayout({ children }) {
  return <AdminAuthGuard>{children}</AdminAuthGuard>;
}
