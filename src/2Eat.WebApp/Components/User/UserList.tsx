import React, { Suspense } from "react";
import useQuery from "../../Helpers/useQuery";
import { fetchUsers } from "../../Services/User/api";
import { User } from "../../Models/user";

const UserList: React.FC = () => {
  const users = useQuery(fetchUsers, "users");

  return (
    <div>
      <h1>User List</h1>
      <Suspense fallback={<div>Loading users...</div>}>
        <ul>
          {users?.map((user: User) => (
            <li key={user.id}>
              {user.name} ({user.email})
            </li>
          ))}
        </ul>
      </Suspense>
    </div>
  );
};

export default UserList;
