"use client";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { navItems } from "@/constants";
import { cn } from "@/lib/utils";
import { Separator } from "@radix-ui/react-separator";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import FileUploader from "./FileUploader";
import { Button } from "./ui/button";
import { signOut } from "@/lib/actions/user.actions";

const MobileNavigation = ({
  avatar,
  fullName,
  email,
}: {
  avatar: string;
  fullName: string;
  email: string;
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const pathname = usePathname();
  //problem when using desktop app and open is true header will be hidden
  return (
    <header className="mobile-header">
      <Image
        src="/assets/icons/logo-full-brand.svg"
        width={120}
        height={52}
        alt="logo"
        className="h-auto"
      />
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger>
          <Image
            src="/assets/icons/menu.svg"
            width={30}
            height={30}
            alt="search"
          />
        </SheetTrigger>
        <SheetContent className="shad-sheet h-screen px-3">
          <SheetTitle>
            <div className="header-user">
              <Image
                src={avatar}
                width={44}
                height={44}
                alt="avatar"
                className="header-user-avatar"
              />
              <div className="sm:hidden lg:block">
                <p className="subtitle- capitalize2">{fullName}</p>
                <p className="caption">{email}</p>
              </div>
            </div>
            <Separator className="mb-4 bg-light-200/100" />
          </SheetTitle>
          <nav className="mobile-nav">
            <ul className="mobile-nav-list">
              {navItems.map(({ url, icon, name }) => (
                <Link key={name} href={url} className="lg:w-full">
                  <li
                    className={cn(
                      "mobile-nav-item",
                      pathname === url && "shad-active"
                    )}>
                    <Image
                      src={icon}
                      alt={name}
                      width={24}
                      height={24}
                      className={cn(
                        "nav-icon",
                        pathname === url && "nav-icon-active"
                      )}
                    />
                    <p>{name}</p>
                  </li>
                </Link>
              ))}
            </ul>
          </nav>
          <Separator className="my-5 bg-light-200/100" />
          <div className="flex flex-col justify-between gap-5 pb-5">
            <FileUploader />
            <Button
              className="mobile-sign-out-button"
              type="submit"
              onClick={signOut}>
              <Image
                src="/assets/icons/logout.svg"
                width={24}
                height={24}
                alt="logout"
              />
              <p>Logout</p>
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
};

export default MobileNavigation;
