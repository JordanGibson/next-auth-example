import { ReactNode } from "react";
import { StyledLoading } from "@nextui-org/react";

const Loading = (): ReactNode => {
  return (
    <>
      <div className={"min-w-full min-h-full ag-overlay opacity-50"}></div>
    </>
  );
};

export default Loading;
