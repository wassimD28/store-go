"use client";

import { DataTable } from "@/client/components/data-table/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/client/components/ui/checkbox";
import { Button } from "@/client/components/ui/button";
import { Eye, Pencil } from "lucide-react";
import { formatDate, formatTimeDifference } from "@/lib/utils";
import { SortableHeader } from "@/client/components/data-table/sortableHeader";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Badge } from "@/client/components/ui/badge";
import { useState } from "react";
import { AppUserViewSheet } from "../../sheet/app-user-view-sheet";
import { AppUserDeleteDialog } from "../../dialogs/deleteAppUserDialog";

interface AppUser {
  id: string;
  storeId: string;
  name: string;
  email: string;
  avatar?: string | null;
  gender?: string | null;
  age_range?: string | null;
  auth_type: string;
  is_online: boolean;
  last_seen: Date | null;
  auth_provider?: string | null;
  status: boolean;
  created_at: Date;
  updated_at: Date;
}

interface AppUserTableClientProps {
  users: AppUser[];
  storeId: string;
}

export function AppUserTableClient({
  users,
  storeId,
}: AppUserTableClientProps) {
  const router = useRouter();
  const [selectedUser, setSelectedUser] = useState<AppUser | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  const refreshData = () => {
    router.refresh();
  };

  // Function to handle view user
  const handleViewUser = (user: AppUser) => {
    setSelectedUser(user);
    setIsViewOpen(true);
  };
  // Function to truncate email with ellipsis if too long
  const truncateEmail = (email: string, maxLength = 25) => {
    if (email.length <= maxLength) return email;
    return `${email.substring(0, maxLength)}...`;
  };

  // Define columns for the DataTable
  const columns: ColumnDef<AppUser>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      maxSize: 40,
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <SortableHeader column={column} title="Customer" />
      ),
      cell: ({ row }) => {
        const user = row.original;
        const avatarUrl = user.avatar || "/unknown-user.svg";
        const isOnline = user.is_online;

        return (
          <div className="flex items-center space-x-3">
            <div className="relative h-10 w-10 min-w-10 overflow-hidden rounded-full bg-gray-100">
              <Image
                src={avatarUrl}
                alt={user.name}
                width={40}
                height={40}
                className="h-full w-full object-cover"
              />
              {/* Status indicator dot */}
              <div className="absolute bottom-0 right-0 translate-x-1/4 translate-y-1/4 transform">
                <div
                  className={`h-3 w-3 rounded-full border-2 border-white ${
                    isOnline
                      ? "animate-pulse bg-green-500"
                      : user.last_seen &&
                          new Date().getTime() -
                            new Date(user.last_seen).getTime() <
                            600000
                        ? "bg-yellow-500"
                        : "bg-gray-300"
                  }`}
                />
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">{user.name}</div>
              <div className="truncate text-xs text-muted-foreground">
                {truncateEmail(user.email)}
              </div>
            </div>
          </div>
        );
      },
      minSize: 200,
    },
    {
      accessorKey: "is_online",
      header: "Online Status",
      cell: ({ row }) => {
        const isOnline = row.getValue("is_online") as boolean;
        const lastSeen = row.original.last_seen as Date | null;

        if (isOnline) {
          return (
            <div className="flex items-center">
              <div className="relative mr-2">
                <div className="h-3 w-3 animate-pulse rounded-full bg-green-500"></div>
              </div>
              <span>Online</span>
            </div>
          );
        } else if (lastSeen) {
          const now = new Date();
          const diff = now.getTime() - new Date(lastSeen).getTime();
          const minutes = Math.floor(diff / 60000);

          // If seen within last 10 minutes, show "Away"
          if (minutes < 10) {
            return (
              <div className="flex items-center">
                <div className="relative mr-2">
                  <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                </div>
                <span>Away ({minutes}m)</span>
              </div>
            );
          } else {
            return (
              <div className="flex items-center">
                <div className="relative mr-2">
                  <div className="h-3 w-3 rounded-full bg-gray-300"></div>
                </div>
                <span>Offline · {formatTimeDifference(lastSeen)}</span>
              </div>
            );
          }
        }

        return (
          <div className="flex items-center">
            <div className="relative mr-2">
              <div className="h-3 w-3 rounded-full bg-gray-300"></div>
            </div>
            <span>Never online</span>
          </div>
        );
      },
    },
    {
      accessorKey: "email",
      header: ({ column }) => <SortableHeader column={column} title="Email" />,
      cell: ({ row }) => {
        const email = row.getValue("email") as string;
        return (
          <div className="truncate" title={email}>
            {email}
          </div>
        );
      },
      maxSize: 300,
      minSize: 200,
    },
    {
      accessorKey: "gender",
      header: "Gender",
      cell: ({ row }) => {
        const gender = row.getValue("gender") as string | null;
        return <div className="capitalize">{gender || "Not specified"}</div>;
      },
    },
    {
      accessorKey: "age_range",
      header: "Age Range",
      cell: ({ row }) => {
        const ageRange = row.getValue("age_range") as string | null;
        return <div>{ageRange || "Not specified"}</div>;
      },
    },
    {
      accessorKey: "auth_type",
      header: "Auth Method",
      cell: ({ row }) => {
        const authType = row.getValue("auth_type") as string;
        const authProvider = row.original.auth_provider;

        return (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="capitalize">
              {authType.replace("_", " ")}
            </Badge>
            {authProvider && (
              <Badge className="bg-blue-100 capitalize text-blue-800">
                {authProvider}
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as boolean;

        return (
          <Badge variant={status ? "default" : "destructive"}>
            {status ? "Active" : "Inactive"}
          </Badge>
        );
      },
    },
    {
      accessorKey: "created_at",
      header: ({ column }) => <SortableHeader column={column} title="Joined" />,
      cell: ({ row }) => {
        const date = row.getValue("created_at") as Date;
        return <div>{formatDate(date)}</div>;
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const user = row.original;

        return (
          <div className="flex space-x-2">
            {/* View Action */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleViewUser(user)}
              title="View Customer"
            >
              <Eye className="h-4 w-4" />
            </Button>

            {/* Edit Action */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                router.push(`/stores/${storeId}/customers/${user.id}/edit`);
              }}
              title="Edit Customer"
            >
              <Pencil className="h-4 w-4" />
            </Button>

            <AppUserDeleteDialog
              userId={user.id}
              userName={user.name}
              onDeleteSuccess={refreshData}
            />
          </div>
        );
      },
    },
  ];

  return (
    <>
      <DataTable
        data={users}
        columns={columns}
        filterColumn="name"
        filterPlaceholder="Search customers..."
        initialVisibility={{
          created_at: false,
          email: false, // Hide email column initially
        }}
      />

      {/* Render the AppUserViewSheet when a user is selected */}
      {selectedUser && (
        <AppUserViewSheet
          user={selectedUser}
          isOpen={isViewOpen}
          onOpenChange={setIsViewOpen}
        />
      )}
    </>
  );
}
