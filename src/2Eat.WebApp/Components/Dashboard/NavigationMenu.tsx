function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default function NavigationMenu({
  navigation,
}: {
  navigation: {
    name: string;
    href: string;
    current: boolean;
    visible: boolean;
  }[];
}) {
  return (
    <div className="flex items-center">
      <div className="shrink-0">
        <img
          alt="Your Company"
          src="https://tailwindui.com/plus-assets/img/logos/mark.svg?color=indigo&shade=500"
          className="size-8"
        />
      </div>
      <div className="hidden md:block">
        <div className="ml-10 flex items-baseline space-x-4">
          {navigation
            .filter((x) => x.visible)
            .map((item) => (
              <a
                key={item.name}
                href={item.href}
                aria-current={item.current ? "page" : undefined}
                className={classNames(
                  item.current
                    ? "bg-gray-900 text-white"
                    : "text-gray-300 hover:bg-gray-700 hover:text-white",
                  "rounded-md px-3 py-2 text-sm font-medium"
                )}
              >
                {item.name}
              </a>
            ))}
        </div>
      </div>
    </div>
  );
}
