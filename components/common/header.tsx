import { Fragment, useEffect, useState } from "react";
import { Disclosure, Menu, Transition } from "@headlessui/react";
import { signIn, SignInResponse, signOut, useSession } from "next-auth/react";
import { Session } from "next-auth";
import router, { useRouter } from "next/router";
import Link from "next/link";
import ThemeSwitch from "./themeSwitch";

const navigation = [
  { name: "Suites", href: "suites", current: true },
  { name: "Dashboard", href: "dashboard", current: false },
  { name: "Projects", href: "projects", current: false },
  { name: "Calendar", href: "calendar", current: false },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

const SignInButton = (props: {
  onClick: () => Promise<SignInResponse | undefined>;
}) => <button onClick={props.onClick}>Sign In</button>;

function ProfileWithDropdown(props: { session: Session }) {
  return (
    <Menu as="div" className="relative ml-3">
      <div>
        <Menu.Button className="flex rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2">
          <span className="sr-only">Open user menu</span>
          <img
            className="h-8 w-8 rounded-full"
            src={
              props?.session?.user?.image ||
              "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"
            }
            alt=""
          />
        </Menu.Button>
      </div>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <Menu.Item>
            {({ active }) => (
              <a
                href="components/common/header.js#"
                className={classNames(
                  active ? "" : "",
                  "block px-4 py-2 text-sm"
                )}
              >
                Your Profile
              </a>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <a
                href="components/common/header.js#"
                className={classNames(
                  active ? "" : "",
                  "block px-4 py-2 text-sm"
                )}
              >
                Settings
              </a>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <a
                onClick={() => signOut()}
                className={classNames(
                  active ? "" : "",
                  "block px-4 py-2 text-sm"
                )}
              >
                Sign out
              </a>
            )}
          </Menu.Item>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}

export default function Navbar() {
  let { data: session } = useSession();

  const [activeHeader, setActiveHeader] = useState("");
  const router = useRouter();

  let route = router.route.split("/")[1].toLowerCase();
  const navigation = [
    {
      name: "Suites",
      href: "suites",
      current: route === "suites",
    },
    {
      name: "Dashboard",
      href: "dashboard",
      current: route === "dashboard",
    },
    {
      name: "Projects",
      href: "projects",
      current: route === "projects",
    },
    {
      name: "Calendar",
      href: "calendar",
      current: route === "calendar",
    },
  ];
  return (
    <>
      <div className="sticky top-0 z-40 w-full backdrop-blur flex-none transition-colors duration-500 lg:z-50 border-b border-slate-50/[0.06] bg-transparent">
        <Disclosure as="nav" className="">
          {({ open }) => (
            <>
              <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
                <div className="relative flex h-16 items-center justify-between">
                  <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
                    <p className="text-center my-auto font-bold text-xl">
                      Smart
                    </p>
                    <div className="hidden sm:ml-6 sm:block">
                      <div className="flex space-x-4">
                        {navigation.map((item) => (
                          <Link
                            key={item.name}
                            href={item.href}
                            passHref
                            className={classNames(
                              item.current ? "text-primary-f" : "",
                              "px-3 py-2 rounded-md text-sm font-medium"
                            )}
                            aria-current={item.current ? "page" : undefined}
                            onClick={() => {
                              setActiveHeader(item.name);
                            }}
                          >
                            {item.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                  <ThemeSwitch />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                    {session?.user ? (
                      <ProfileWithDropdown session={session} />
                    ) : (
                      <>
                        <SignInButton onClick={() => signIn("github")} />
                      </>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </Disclosure>
      </div>
    </>
  );
}
