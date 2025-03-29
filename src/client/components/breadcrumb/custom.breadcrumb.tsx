"use client";

import React from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/client/components/ui/breadcrumb";

// Define the type for breadcrumb items
interface BreadcrumbItem {
  name: string;
  route: string;
}

// Props interface for the component
interface CustomBreadcrumbProps {
  items?: BreadcrumbItem[];
}

export function CustomBreadcrumb({ items = [] }: CustomBreadcrumbProps) {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        {/* Always include Home as first item */}
        <BreadcrumbItem key="home">
          <BreadcrumbLink href="/">Home</BreadcrumbLink>
        </BreadcrumbItem>

        <BreadcrumbSeparator key="separator-home" />

        {items.map((item, index) => {
          const isLastItem = index === items.length - 1;

          return (
            <React.Fragment key={`breadcrumb-${item.name}-${index}`}>
              <BreadcrumbItem key={`item-${item.name}-${index}`}>
                {isLastItem ? (
                  <BreadcrumbPage>{item.name}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink href={item.route}>{item.name}</BreadcrumbLink>
                )}
              </BreadcrumbItem>

              {!isLastItem && (
                <BreadcrumbSeparator key={`separator-${item.name}-${index}`} />
              )}
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
