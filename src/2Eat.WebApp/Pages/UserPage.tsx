import { Suspense } from "react";
import { useParams } from "react-router-dom";
import useQuery from "../Helpers/useQuery";
import { fetchUserById } from "../Services/User/api";

const UserPage = () => {
  const { id } = useParams<{ id: string }>();
  const user = useQuery(() => fetchUserById(Number(id)), `user-${id}`);
  return (
    <>
      {id ? (
        <div>
          <Suspense fallback={<div>Loading user...</div>}>
            <div>
              <p>Name: {user?.name}</p>
              <p>Email: {user?.email}</p>
              <p>Username: {user?.username}</p>
              {/* Add more user details as needed */}
            </div>
          </Suspense>
        </div>
      ) : (
        <p>Page item is not present</p>
      )}
    </>
  );
};

export default UserPage;
