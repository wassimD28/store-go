"use client";
import { BadgeCheck, Bell, CreditCard, LogOut, Sparkles } from "lucide-react";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/client/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/client/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";
import { redirect } from "next/navigation";
import { cn, getInitials, truncateEmail } from "@/lib/utils";
import { NavUserData } from "@/lib/types/interfaces/common.interface";
import { FadeText } from "../ui/fade-text";
import { useUserStore } from "@/client/store/user.store";
import { useEffect } from "react";

interface NavUserProps {
  user: NavUserData;
  isExpend: boolean;
}
export function NavUser({ user, isExpend }: NavUserProps) {
  const { setUser } = useUserStore();
  useEffect(() => {
    setUser(user);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div
          className={cn(
            "mt-2 grid w-[32px] grid-cols-[32px_120px] items-center gap-2 overflow-hidden rounded-lg px-2 py-2 transition-all duration-200 ease-in-out hover:bg-foreground/10",
            isExpend && "w-[190px]",
            !isExpend && "px-0",
          )}
        >
          <Avatar className="h-8 w-8 rounded-full">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="rounded-lg">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <FadeText
              className="truncate font-semibold"
              direction="left"
              text={user.name}
              isVisible={isExpend}
            />
            <FadeText
              className="truncate text-xs text-foreground/50"
              direction="left"
              text={truncateEmail(user.email)}
              isVisible={isExpend}
            />
          </div>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
        side="top"
        align="end"
        sideOffset={4}
      >
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
            <Avatar className="h-8 w-8 rounded-lg">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="rounded-lg">CN</AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">{user.name}</span>
              <span className="truncate text-xs">{user.email}</span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <Sparkles />
            Upgrade to Pro
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <BadgeCheck />
            Account
          </DropdownMenuItem>
          <DropdownMenuItem>
            <CreditCard />
            Billing
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Bell />
            Notifications
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            authClient.signOut({
              fetchOptions: {
                onSuccess: () => {
                  redirect("/sign-in");
                },
              },
            });
          }}
        >
          <LogOut />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
