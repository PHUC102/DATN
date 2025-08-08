import { Container } from "@/components/ui/container";
import { ManagerReviewClient } from "./components/client";
import { getCurrentUser } from "@/actions/get-current-user";
import { AccessDenied } from "@/components/access-denied";
import getReviews from "@/actions/get-reviews";

export default async function ManageUsersPage() {
  const reviews = await getReviews();
  const currentUser = await getCurrentUser();

  if (!currentUser || currentUser.role !== "ADMIN") {
    return <AccessDenied title="Truy cập bị từ chối" />;
  }
  return (
    <div>
      <Container>
        <ManagerReviewClient reviews={reviews} />
      </Container>
    </div>
  );
}
