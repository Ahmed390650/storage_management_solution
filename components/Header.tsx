import React from "react";
import FileUploader from "./FileUploader";
import Search from "./Search";
import Image from "next/image";
import { Button } from "./ui/button";
import { signOut } from "@/lib/actions/user.actions";

const Header = ({
  userId,
  accountId,
}: {
  userId: string;
  accountId: string;
}) => {
  return (
    <header className="header">
      <Search />
      <div className="header-wrapper">
        <FileUploader accountId={accountId} ownerId={userId} />
        <form
          action={async () => {
            "use server";
            await signOut();
          }}>
          <Button type="submit" className="sign-out-button">
            <Image
              src="assets/icons/logout.svg"
              alt="logo"
              width={24}
              height={24}
              className="w-6"
            />
          </Button>
        </form>
      </div>
    </header>
  );
};

export default Header;
