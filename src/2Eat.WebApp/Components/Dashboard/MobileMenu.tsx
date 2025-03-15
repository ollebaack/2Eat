import { DisclosurePanel, DisclosureButton } from "@headlessui/react";
import { User } from "../../Models/user";

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default function MobileMenu({
  navigation,
  user,
  userNavigation,
}: {
  navigation: {
    name: string;
    href: string;
    current: boolean;
    visible: boolean;
  }[];
  user: User;
  userNavigation: { name: string; href: string }[];
}) {
  return (
    <DisclosurePanel className="md:hidden">
      <div className="space-y-1 px-2 pt-2 pb-3 sm:px-3">
        {navigation
          .filter((x) => x.visible)
          .map((item) => (
            <DisclosureButton
              key={item.name}
              as="a"
              href={item.href}
              aria-current={item.current ? "page" : undefined}
              className={classNames(
                item.current
                  ? "bg-gray-900 text-white"
                  : "text-gray-300 hover:bg-gray-700 hover:text-white",
                "block rounded-md px-3 py-2 text-base font-medium"
              )}
            >
              {item.name}
            </DisclosureButton>
          ))}
      </div>
      <div className="border-t border-gray-700 pt-4 pb-3">
        <div className="flex items-center px-5">
          <div className="shrink-0">
            <img alt="" src={user.imageUrl} className="size-10 rounded-full" />
          </div>
          <div className="ml-3">
            <div className="text-base/5 font-medium text-white">
              {user.name}
            </div>
            <div className="text-sm font-medium text-gray-400">
              {user.email}
            </div>
          </div>
          <button
            type="button"
            className="relative ml-auto shrink-0 rounded-full bg-gray-800 p-1 text-gray-400 hover:text-white focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 focus:outline-hidden"
          >
            <span className="absolute -inset-1.5" />
            <span className="sr-only">View notifications</span>
          </button>
        </div>
        <div className="mt-3 space-y-1 px-2">
          {userNavigation.map((item) => (
            <DisclosureButton
              key={item.name}
              as="a"
              href={item.href}
              className="block rounded-md px-3 py-2 text-base font-medium text-gray-400 hover:bg-gray-700 hover:text-white"
            >
              {item.name}
            </DisclosureButton>
          ))}
        </div>
      </div>
    </DisclosurePanel>
  );
}
