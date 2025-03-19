// src/client/components/sidebar/nav-user-data.tsx

"use server";
import { getSessionAction } from "@/server/actions/getSession.action";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { getInitials } from "@/lib/utils";

async function NavUserData() {
  const session = await getSessionAction();
  const { user } = session || {};

  return (
    <>
      <Avatar className="h-8 w-8 rounded-lg">
        <AvatarImage
          src={user?.image ?? undefined}
          alt={user?.name || "User"}
        />
        <AvatarFallback className="rounded-lg">{getInitials(user?.name)}</AvatarFallback>
      </Avatar>
      <div className="grid flex-1 text-left text-sm leading-tight">
        <span className="truncate font-semibold">{user?.name}</span>
        <span className="truncate text-xs">{user?.email}</span>
      </div>
    </>
  );
}

export default NavUserData;
