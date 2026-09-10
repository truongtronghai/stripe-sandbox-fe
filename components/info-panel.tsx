import { Item, ItemContent, ItemMedia, ItemTitle } from "@/components/ui/item";
import { Spinner } from "@/components/ui/spinner";
import { CircleCheck, CircleX, CircleQuestionMark } from "lucide-react";

import type { FC } from "react";

type InfoPanelProps = {
  type: "success" | "inProgress" | "error";
  message?: string;
};
const IndicatorIcon = ({ type }: { type: "success" | "inProgress" | "error" }) => {
  switch (type) {
    case "success":
      return <CircleCheck />;
    case "error":
      return <CircleX />;
    case "inProgress":
      return <Spinner />;
    default:
      return <CircleQuestionMark />;
  }
};

const InfoPanel: FC<InfoPanelProps> = (props) => {
  return (
    <div className="flex w-full max-w-fit flex-col gap-4 [--radius:1rem]">
      <Item variant="muted">
        <ItemMedia>
          <IndicatorIcon type={props.type} />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>{props.message || "Processing payment..."}</ItemTitle>
        </ItemContent>
      </Item>
    </div>
  );
};

export default InfoPanel;
