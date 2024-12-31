import { cn, getFileIcon } from "@/lib/utils";
import Image from "next/image";
import React from "react";
interface props {
  className?: string;
  type: "image" | "video" | "audio" | "document" | "other";
  extension: string;
  imageClassName?: string;
  url?: string;
}
const Thumbnail = ({
  className,
  type,
  extension,
  url = "",
  imageClassName,
}: props) => {
  const isImage = type === "image" && extension !== "svg";

  return (
    <figure className={cn("thumbnail", className)}>
      <Image
        src={isImage ? url : getFileIcon(extension, type)}
        alt="thumbnaik"
        width={100}
        height={100}
        className={cn(
          "size-8 object-contain",
          imageClassName,
          isImage && "thumbnail-image"
        )}
      />
    </figure>
  );
};

export default Thumbnail;
