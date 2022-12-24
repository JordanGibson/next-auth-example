import { Fragment, useEffect, useState } from "react";
import { Disclosure, Menu, Transition } from "@headlessui/react";
import { signIn, SignInResponse, signOut, useSession } from "next-auth/react";
import { Session } from "next-auth";
import router, { useRouter } from "next/router";
import Link from "next/link";

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
}) => (
  <button
    className="rounded-lg px-4 py-2 bg-blue-500 text-white font-bold hover:bg-blue-700"
    onClick={props.onClick}
  >
    Sign In
  </button>
);

function ProfileWithDropdown(props: { session: Session }) {
  return (
    <Menu as="div" className="relative ml-3">
      <div>
        <Menu.Button className="flex rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
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
        <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <Menu.Item>
            {({ active }) => (
              <a
                href="#"
                className={classNames(
                  active ? "bg-gray-100" : "",
                  "block px-4 py-2 text-sm text-gray-700"
                )}
              >
                Your Profile
              </a>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <a
                href="#"
                className={classNames(
                  active ? "bg-gray-100" : "",
                  "block px-4 py-2 text-sm text-gray-700"
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
                  active ? "bg-gray-100" : "",
                  "block px-4 py-2 text-sm text-gray-700"
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

  const navigation = [
    {
      name: "Suites",
      href: "suites",
      current: router.route.split("/")[1].toLowerCase() === "suites",
    },
    {
      name: "Dashboard",
      href: "dashboard",
      current: router.route.split("/")[1].toLowerCase() === "dashboard",
    },
    {
      name: "Projects",
      href: "projects",
      current: router.route.split("/")[1].toLowerCase() === "projects",
    },
    {
      name: "Calendar",
      href: "calendar",
      current: router.route.split("/")[1].toLowerCase() === "calendar",
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
                    <div className="flex flex-shrink-0 items-center">
                      <img
                        className="h-8 w-auto"
                        src={"/Logo.svg"}
                        alt="Smart"
                      />
                    </div>
                    <div className="hidden sm:ml-6 sm:block">
                      <div className="flex space-x-4">
                        {navigation.map((item) => (
                          <Link
                            key={item.name}
                            href={item.href}
                            passHref
                            className={classNames(
                              item.current
                                ? "bg-gray-900 text-white"
                                : "text-gray-300 hover:bg-gray-700 hover:text-white",
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
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                    {session?.user ? (
                      <ProfileWithDropdown session={session} />
                    ) : (
                      <>
                        <SignInButton onClick={() => signIn("github")} />)
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
