import { Disclosure } from "@headlessui/react";
import { Outlet, useLocation } from "react-router-dom";
import NavigationMenu from "./NavigationMenu";
import ProfileDropdown from "./ProfileDropdown";
import Header from "./Header";
import MobileMenu from "./MobileMenu";
import MobileMenuButton from "./MobileMenuButton";
import { User } from "../../Models/user";

const currentUser: User = {
  id: 1,
  name: "Tom Cook",
  email: "tom@example.com",
  username: "tomcook",
  imageUrl:
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
};

export default function Dashboard() {
  const location = useLocation();

  const navigation = [
    {
      name: "Dashboard",
      href: "/",
      current: location.pathname === "/",
      visible: true,
    },
    {
      name: "Leaderboard",
      href: "/leaderboard",
      current: location.pathname === "/leaderboard",
      visible: true,
    },
    {
      name: "User Profile",
      href: "/user",
      current: location.pathname.includes("/user"),
      visible: false,
    },
  ];

  const userNavigation = [
    { name: "Your Profile", href: `/user/${currentUser.id}` },
    { name: "Settings", href: "#" },
    { name: "Sign out", href: "#" },
  ];

  return (
    <div className="min-h-full">
      <Disclosure as="nav" className="bg-gray-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <NavigationMenu navigation={navigation} />
            <div className="hidden md:block">
              <div className="ml-4 flex items-center md:ml-6">
                <ProfileDropdown
                  user={currentUser}
                  userNavigation={userNavigation}
                />
              </div>
            </div>
            <MobileMenuButton />
          </div>
        </div>
        <MobileMenu
          navigation={navigation}
          user={currentUser}
          userNavigation={userNavigation}
        />
      </Disclosure>
      <Header title={navigation.find((x) => x.current)?.name as string} />
      <main>
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
