import { cn } from "@/lib/utils";
import React from "react";

const FormattedDateTime = ({
  date,
  className,
}: {
  date: Date;
  className?: string;
}) => {
  return (
    <p className={cn("body-1 text-light-200", className)}>
      {Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      }).format(date)}
    </p>
  );
};

export default FormattedDateTime;
