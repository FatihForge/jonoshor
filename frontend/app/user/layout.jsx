import UserAuthGuard from '../components/UserAuthGuard';

export const metadata = {
  title: 'Dashboard',
  description: 'Private dashboard for users to view submitted grievances, evidence status, and case progress.',
};

export default function UserLayout({ children }) {
  return <UserAuthGuard>{children}</UserAuthGuard>;
}
