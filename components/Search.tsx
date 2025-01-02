"use client";
import Image from "next/image";
import React, { useEffect } from "react";
import { Input } from "./ui/input";
import { useDebounce } from "use-debounce";
import { Models } from "node-appwrite";
import { getFiles } from "@/lib/actions/file.actions";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Thumbnail from "./Thumbnail";
import FormattedDateTime from "./FormattedDateTime";

const Search = () => {
  const [query, setQuery] = React.useState("");
  const [result, setResult] = React.useState<Models.Document[]>([]);
  const [open, setOpen] = React.useState(false);
  const [debouncedQuery] = useDebounce(query, 300);
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("query") || "";
  const path = usePathname();
  const router = useRouter();
  useEffect(() => {
    const fetchFiles = async () => {
      if (debouncedQuery.length === 0) {
        setOpen(false);
        setResult([]);
        return router.push(path.replace(searchParams.toString(), ""));
      }
      const filesList = await getFiles({
        types: [],
        searchText: debouncedQuery,
      });
      setResult(filesList?.documents ?? []);
      setOpen(true);
    };
    fetchFiles();
  }, [debouncedQuery, path, router, searchParams]);
  useEffect(() => {
    if (!searchQuery) {
      setQuery("");
    }
  }, [searchQuery]);
  const handleClickItem = (file: Models.Document) => {
    setOpen(false);
    setQuery("");
    router.push(
      `/${
        file.type === "video" || file.type === "audio"
          ? "media"
          : file.type + "s"
      }?query=${query}`
    );
  };
  return (
    <div className="search">
      <div className="search-input-wrapper">
        <Image
          src="/assets/icons/search.svg"
          width={24}
          height={24}
          alt="search"
        />
        <Input
          value={query}
          placeholder="Search"
          className="search-input"
          onChange={(e) => setQuery(e.target.value)}
        />
        {open && (
          <ul className="search-result">
            {result.length > 0 ? (
              result.map((file) => (
                <li
                  className="flex items-center justify-between"
                  key={file.$id}
                  onClick={() => handleClickItem(file)}>
                  <div className="flex cursor-pointer items-center gap-4">
                    <Thumbnail
                      type={file.type}
                      extension={file.extension}
                      url={file.url}
                      className="size-9 min-w-9"
                    />
                    <p className="subtitle-2 line-clamp-1 text-light-100">
                      {file.name}
                    </p>
                  </div>

                  <FormattedDateTime
                    date={new Date(file.$createdAt)}
                    className="caption line-clamp-1 text-light-200"
                  />
                </li>
              ))
            ) : (
              <p className="empty-result">No files found</p>
            )}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Search;
