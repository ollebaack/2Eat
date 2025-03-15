import { DisclosureButton } from "@headlessui/react";

export default function MobileMenuButton() {
  return (
    <div className="-mr-2 flex md:hidden">
      <DisclosureButton className="group relative inline-flex items-center justify-center rounded-md bg-gray-800 p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 focus:outline-hidden">
        <span className="absolute -inset-0.5" />
        <span className="sr-only">Open main menu</span>
      </DisclosureButton>
    </div>
  );
}
