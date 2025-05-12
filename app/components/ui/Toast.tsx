import {
  Root,
  Title,
  Close,
  Action,
  Viewport,
  Provider,
  Description,
} from "@radix-ui/react-toast";

type Props = {
  title: string;
  close: string;
  action: string;
  description: string;
  actionAltText: string;
};
const Toast = (props: Props) => {
  const { title, description, action, actionAltText, close } = props;

  return (
    <Provider>
      <Root className="bg-red-500 w-[100px] h-[60px]">
        <Title />
        <Description />
        <Action altText={actionAltText} />
        <Close />
      </Root>

      <Viewport />
    </Provider>
  );
};

export default Toast;
