import { useEffect, useState } from "react";
import { useCookies } from "react-cookie";

const ThemeSwitch = () => {
  const [cookies, setCookie] = useCookies(["theme"]);
  const [theme, setTheme] = useState<"light" | "dark">(cookies.theme);

  useEffect(() => {
    setCookie("theme", theme, { path: "/" });
    document.documentElement.setAttribute("data-theme", theme);

    // Persist the theme to the database if the user is signed in
    // TODO: implement database persistence here
  }, [theme]);

  const handleThemeChange = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <>
      <input
        type={"checkbox"}
        className={"toggle"}
        checked={theme === "dark"}
        onChange={handleThemeChange}
      />
    </>
  );
};

export default ThemeSwitch;
