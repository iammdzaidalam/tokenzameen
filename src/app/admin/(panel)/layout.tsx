import { AdminShell } from "@/components/admin/shell";
import { logout } from "../login/actions";

export default function PanelLayout({ children }: LayoutProps<"/admin">) {
  return <AdminShell signOut={logout}>{children}</AdminShell>;
}
