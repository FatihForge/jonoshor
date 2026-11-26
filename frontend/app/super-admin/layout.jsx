import SuperAdminAuthGuard from '../components/SuperAdminAuthGuard';

export const metadata = {
  title: 'Super Admin Console',
  description: 'Administrative portal for cryptographic key management, staff roles, and audit trail inspection.',
};

export default function SuperAdminLayout({ children }) {
  return <SuperAdminAuthGuard>{children}</SuperAdminAuthGuard>;
}
