import React, { FC } from "react";

import { Button, ButtonProps } from "./button";

import { logout } from "~/lib";

export const LogoutButton: FC<ButtonProps> = (props) => {
  return (
    <Button onClick={logout} {...props}>
      Logout
    </Button>
  );
};
