import { Avatar, AvatarFallback, AvatarImage } from "./avatar";

export default { title: "UI/Avatar" };

export const Default = () => {
  return (
    <Avatar>
      <AvatarImage src="https://avatars.githubusercontent.com/u/26530621?v=4" alt="@kelly10" />
      <AvatarFallback>KO</AvatarFallback>
    </Avatar>
  );
};

export const Fallback = () => {
  return (
    <Avatar>
      <AvatarFallback>KO</AvatarFallback>
    </Avatar>
  );
};
