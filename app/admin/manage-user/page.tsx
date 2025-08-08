import { Container } from "@/components/ui/container";
import { ManagerUserClient } from "./components/client";
import { getCurrentUser } from "@/actions/get-current-user";
import { AccessDenied } from "@/components/access-denied";
import getUsers from "@/actions/get-users";

export default async function ManageUsersPage() {
  const users = await getUsers();
  const currentUser = await getCurrentUser();

  if (!currentUser || currentUser.role !== "ADMIN") {
    return <AccessDenied title="Truy cập bị từ chối" />;
  }
  return (
    <div>
      <Container>
        <ManagerUserClient users={users} />
      </Container>
    </div>
  );
}
