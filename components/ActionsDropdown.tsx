"use client";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { actionsDropdownItems } from "@/constants";
import { constructDownloadUrl } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { Models } from "node-appwrite";
import { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import {
  deleteFile,
  renameFile,
  updateFileUser,
} from "@/lib/actions/file.actions";
import { usePathname } from "next/navigation";
import { FileDetails, ShareInput } from "./ActionsModalContent";

const ActionsDropdown = ({ file }: { file: Models.Document }) => {
  const [isModelOpen, setIsModelOpen] = useState(false);
  const path = usePathname();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [action, setAction] = useState<ActionType | null>(null);
  const [name, setName] = useState(file.name);
  const [loading, setLoading] = useState(false);
  const [emails, setEmails] = useState<string[]>(file.users);
  const closeAllModels = () => {
    setIsModelOpen(false);
    setIsDropdownOpen(false);
    setAction(null);
    setName(file.name);
  };
  const handleRemoveUser = async (email: string) => {
    const updatedEmails = emails.filter((e) => e !== email);
    setLoading(true);
    const success = await updateFileUser({
      fileId: file.$id,
      emails: updatedEmails,
      path,
    });

    if (success) setEmails(updatedEmails);
    setLoading(false);
    // closeAllModels();
  };

  const handleActions = async () => {
    if (!action) return;
    setLoading(true);
    let success = false;
    const actions = {
      rename: () =>
        renameFile({
          fileId: file.$id,
          extension: file.extension,
          name,
          path,
        }),
      share: () => updateFileUser({ emails, fileId: file.$id, path }),
      delete: () =>
        deleteFile({
          fileId: file.$id,
          path: path,
          bucketFileId: file.bucketField,
        }),
    };
    success = await actions[action.value as keyof typeof actions]();
    if (success) closeAllModels();
    setLoading(false);
  };
  const renderDialogContent = () => {
    if (!action) return null;
    const { label, value } = action;
    return (
      <DialogContent className="shad-dialog button">
        <DialogHeader className="flex flex-col gap-3">
          <DialogTitle className="text-center text-light-100">
            {label}
          </DialogTitle>
          {value === "rename" && (
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          )}
          {value === "details" && <FileDetails file={file} />}
          {value === "share" && (
            <ShareInput
              file={file}
              onInputChange={setEmails}
              onRemove={handleRemoveUser}
            />
          )}
        </DialogHeader>
        {["rename", "share", "delete"].includes(value) && (
          <DialogFooter className="flex flex-col gap-3 md:flex-row">
            <Button onClick={closeAllModels} className="modal-cancel-button">
              Cancel
            </Button>
            <Button className="modal-submit-button" onClick={handleActions}>
              <p className="capitalize">{value}</p>
              {loading && (
                <Image
                  src="/assets/icons/loader.svg"
                  height={24}
                  width={24}
                  className="animate-spin"
                  alt="loading"
                />
              )}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    );
  };
  return (
    <Dialog onOpenChange={setIsModelOpen} open={isModelOpen}>
      <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
        <DropdownMenuTrigger className="shad-no-focus">
          <Image
            src="/assets/icons/dots.svg"
            height={34}
            width={34}
            alt="dot"
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel className="max-w-[200px] truncate">
            {file.name}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {actionsDropdownItems.map((actionItem) => (
            <DropdownMenuItem
              key={actionItem.value}
              className="shad-dropdown-item"
              onClick={() => {
                setAction(actionItem);
                if (
                  ["rename", "share", "delete", "details"].includes(
                    actionItem.value
                  )
                ) {
                  setIsModelOpen(true);
                }
              }}>
              {actionItem.value === "download" ? (
                <Link
                  href={constructDownloadUrl(file.bucketField)}
                  className="flex items-center gap-2"
                  download={file.name}>
                  <Image
                    src={actionItem.icon}
                    alt={actionItem.label}
                    width={30}
                    height={30}
                  />
                  {actionItem.label}
                </Link>
              ) : (
                <div className="flex items-center gap-2">
                  <Image
                    src={actionItem.icon}
                    alt={actionItem.label}
                    width={30}
                    height={30}
                  />
                  {actionItem.label}
                </div>
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      {renderDialogContent()}
    </Dialog>
  );
};

export default ActionsDropdown;
